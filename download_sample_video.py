"""
Download sample traffic video for testing ambulance detection.
This script downloads a sample traffic video from Pexels (free stock videos).
"""

import requests
import os
from tqdm import tqdm

def download_file(url, filename):
    """Download a file with progress bar."""
    response = requests.get(url, stream=True)
    total_size = int(response.headers.get('content-length', 0))
    
    with open(filename, 'wb') as file, tqdm(
        desc=filename,
        total=total_size,
        unit='iB',
        unit_scale=True,
        unit_divisor=1024,
    ) as progress_bar:
        for data in response.iter_content(chunk_size=1024):
            size = file.write(data)
            progress_bar.update(size)
    
    print(f"\nDownloaded: {filename}")

def main():
    # Create data directory if it doesn't exist
    data_dir = "data"
    os.makedirs(data_dir, exist_ok=True)
    
    # Sample traffic videos from Pexels (free to use)
    videos = [
        {
            "name": "traffic_sample.mp4",
            "url": "https://videos.pexels.com/video-files/2103099/2103099-hd_1920_1080_30fps.mp4",
            "description": "City traffic video"
        }
    ]
    
    print("Downloading sample traffic videos...\n")
    
    for video in videos:
        filepath = os.path.join(data_dir, video['name'])
        
        if os.path.exists(filepath):
            print(f"File already exists: {filepath}")
            continue
            
        print(f"Downloading: {video['description']}")
        try:
            download_file(video['url'], filepath)
        except Exception as e:
            print(f"Error downloading {video['name']}: {e}")
    
    print("\n✓ Download complete!")
    print(f"Videos saved to: {os.path.abspath(data_dir)}")
    print("\nTo run the detection, use:")
    print(f"python src/main.py --input {os.path.join(data_dir, 'traffic_sample.mp4')}")

if __name__ == "__main__":
    main()
