from langchain_ollama import OllamaEmbeddings
from models.videos import VideoResponse
import numpy as np

class VideoMatcher:
    """Matches videos to user messages based on the video's description."""

    def __init__(self, videos:list[VideoResponse],idle_video: VideoResponse):
        self.videos = videos
        self.idle_video = idle_video
        self.embeddings = OllamaEmbeddings(model="nomic-embed-text")
        self.video_matrix = None
        self._build_video_matrix()

    def _build_video_matrix(self):
        """Loads videos for the project using the video service."""
        if not self.videos:
            return

        # Precompute the normalized embedding matrix for the video descriptions.
        video_embeddings = np.array([self.embeddings.embed(f"{video.label}\n{video.description or ''}") for video in self.videos])
        self.video_matrix = video_embeddings / np.linalg.norm(video_embeddings, axis=1, keepdims=True)

    def match_video(self, query: str):
        """Matches the user message to the most relevant video based on cosine similarity."""
        if not self.video_matrix:
            return None

        # Compute the normalized embedding for the query.
        query_embedding = np.array(self.embeddings.embed(query))
        query_norm = query_embedding / np.linalg.norm(query_embedding)

        similarities = np.dot(self.video_matrix, query_norm)
        best_index = np.argmax(similarities)
        best_score = similarities[best_index]

        # Set a threshold for relevance.
        if best_score < 0.6:
            return self.idle_video

        return self.videos[best_index]



