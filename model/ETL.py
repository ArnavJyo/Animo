from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import csv
from heapq import nlargest
import os
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.impute import SimpleImputer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from scipy.sparse import hstack
from sklearn.preprocessing import MinMaxScaler
# from server import recommend_anime
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, allow_headers=["Content-Type"], methods=["GET", "POST"])

# Define endpoint to receive malId

@app.route('/fetch-anime', methods=['POST'])
def fetch_anime():
    anime_info = request.json.get('animeInfo')
    mal_id = anime_info.get('mal_id')
    
 
    # Check if malId already exists in CSV
    if check_mal_id_exists(mal_id):
        return jsonify({"message": "Anime with given malId already exists"}), 200
    
    try:
        # Fetch anime data from Jikan API
        anime_data = fetch_anime_data(mal_id)
        print("fetched")
        print(anime_data)

        # Transform fetched data
        transformed_data = transform_data(anime_data)
        print("transformed")
       

        # Load transformed data into CSV
        load_into_csv(transformed_data)
        print("loaded")
        create_matrix()
        print("added to similarity matrix")

        return jsonify({"message": "Anime data fetched, transformed, and loaded into CSV"}), 200
    except Exception as e:
        print("Error:", e)
        return jsonify({"message": "Internal server error"}), 500

# Function to check if malId exists in CSV
def check_mal_id_exists(mal_id):
    if not os.path.exists('anime_with_synopsis.csv'):
        return False
    print("checking")
    with open('anime_with_synopsis.csv', 'r',encoding='utf-8') as csv_file:
        csv_reader = csv.reader(csv_file)
        for row in csv_reader:
            if row and row[0] == str(mal_id):
                return True
    return False

# Function to fetch anime data from Jikan API
def fetch_anime_data(mal_id):
    response = requests.get(f'https://api.jikan.moe/v4/anime/{mal_id}/full')
    if response.status_code == 200:
        return response.json()
    else:
        raise Exception("Failed to fetch anime data")

# Function to transform fetched data
def transform_data(anime_data):
    # Extracting data from the provided JSON
    mal_id = anime_data['data']['mal_id']
    title = anime_data['data']['title']
    score = anime_data['data']['score']
    genres = ", ".join(genre['name'] for genre in anime_data['data']['genres'])
    synopsis = anime_data['data']['synopsis'].replace('\n', '')

    # Creating a dictionary with the transformed data
    transformed_data = {
        "MAL_ID": mal_id,
        "Name": title,
        "Score": score,
        "Genres": genres,
        "Synopsis": synopsis
    }
    return transformed_data
# Function to load transformed data into CSV
def load_into_csv(data):
    fieldnames = ["MAL_ID", "Name", "Score", "Genres", "Synopsis"]
    with open('anime_with_synopsis.csv', 'a', newline='',encoding='utf-8') as csv_file:
        csv_writer = csv.DictWriter(csv_file, fieldnames=fieldnames)
        if csv_file.tell() == 0:
            csv_writer.writeheader()
        csv_writer.writerow(data)
def create_matrix():
    df = pd.read_csv("anime_with_synopsis.csv")
    df['Score'].fillna('Unknown', inplace=True)
    df['Score'] = pd.to_numeric(df['Score'], errors='coerce')
    imputer = SimpleImputer(strategy='median')
    df['Score'] = imputer.fit_transform(df[['Score']])

    scaler = MinMaxScaler()
    numeric_scores_normalized = scaler.fit_transform(df['Score'].values.reshape(-1, 1))

    synopsis_vectorizer = TfidfVectorizer(stop_words='english')
    synopsis_matrix = synopsis_vectorizer.fit_transform(df['Synopsis'].fillna(''))

    # Create a TF-IDF vectorizer for genres
    genres_vectorizer = TfidfVectorizer(stop_words='english')
    genres_matrix = genres_vectorizer.fit_transform(df['Genres'])

    # Combine the TF-IDF matrices for synopses and genres
    combined_matrix = hstack([synopsis_matrix, genres_matrix, numeric_scores_normalized])

    # Calculate cosine similarity for combined features
    combined_similarity = cosine_similarity(combined_matrix)

    # Initialize an empty DataFrame to store the top 20 similar anime for each anime
    top_20_similar_anime = pd.DataFrame(index=df['Name'], columns=range(20))

    # Iterate through each anime and store the top 20 similar anime
    for idx, anime_name in enumerate(df['Name']):
        sim_scores = list(enumerate(combined_similarity[idx]))
        sim_scores = nlargest(21, sim_scores, key=lambda x: x[1])  # Get top 20 similar anime
        sim_scores = sim_scores[1:]  # Exclude the first anime (itself)
        top_20_anime_names = [df.iloc[i[0]]['Name'] for i in sim_scores]
        top_20_similar_anime.iloc[idx] = top_20_anime_names

    top_20_similar_anime.to_csv("combined_similarity.csv")
    


@app.route('/recommend-anime',methods =["POST"])
def give_recommendations():
    anime_info = request.json.get('animeInfo')
    recommendations=recommend_anime(anime_info['title'],5)
    return jsonify({"recommendations": recommendations})

@app.route('/for-you', methods=["POST"])
def build_for_you():
    # Get the watchlist from the request
    watchlist = request.json.get('watchlist')
    
    # Generate recommendations for each anime in the watchlist
    all_recommendations = {}
    for anime in watchlist:
        anime_name = anime.get('title')
        recommendations = recommend_anime(anime_name, 5)
        all_recommendations[anime_name] = recommendations
    
    # Send the recommendations to the frontend
    print(all_recommendations)
    return  jsonify(all_recommendations)
    

def recommend_anime(anime_name, num_recommendations=5):
    # Read the CSV file into a DataFrame
    combined_similarity_df = pd.read_csv("combined_similarity.csv")
    anime_with_synopsis_df = pd.read_csv("anime_with_synopsis.csv")
    
    # Filter the DataFrame to get the row corresponding to the given anime_name
    anime_row = combined_similarity_df[combined_similarity_df["Name"] == anime_name]
    
    # Check if anime_name exists in the dataset
    if anime_row.empty:
        print(f"Anime '{anime_name}' not found in the dataset.")
        return None
    
    # Extract the recommended anime titles
    recommended_titles = anime_row.iloc[:, 1:num_recommendations + 1].values.tolist()[0]
    
    # Create a list to store tuples of anime title and MAL_ID
    recommendations = []
    
    # Iterate over recommended anime titles
    for title in recommended_titles:
        # Find the row corresponding to the recommended anime title in anime_with_synopsis_df
        anime_info_row = anime_with_synopsis_df[anime_with_synopsis_df["Name"] == title]

        # Get the MAL_ID of the recommended anime
        mal_id = anime_info_row["MAL_ID"].values[0]
        # Append a tuple of anime title and MAL_ID to the list
        recommendations.append({"title": title, "MAL_ID": int(mal_id)})
    
    return recommendations



if __name__ == '__main__':
    app.run(debug=True,port=8000)
