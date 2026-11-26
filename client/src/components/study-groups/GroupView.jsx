import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft } from "lucide-react";
import PostItem from "./PostItem";
import LoadingSpinner from "../common/LoadingSpinner";

const GroupView = ({
  group,
  posts,
  error,
  onBack,
  onLike,
  onComment,
  fetchMore,
  hasMore,
  isLoadingMore,
}) => {
  const [commentTexts, setCommentTexts] = useState({});
  const scrollableContainerRef = useRef(null);

  const handleCommentChange = (postId, text) => {
    setCommentTexts((prev) => ({ ...prev, [postId]: text }));
  };

  const submitComment = async (postId) => {
    const draft = commentTexts[postId] || "";
    if (await onComment(group.id, postId, draft)) {
      setCommentTexts((prev) => prev[postId] === draft ? { ...prev, [postId]: "" } : prev);
    }
  };

  useEffect(() => {
    const container = scrollableContainerRef.current;
    if (!container || !hasMore) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      if (scrollHeight - scrollTop - clientHeight < 200 && hasMore && !isLoadingMore) {
        fetchMore();
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [fetchMore, hasMore, isLoadingMore, posts]);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <header className="p-4 sm:p-6 sticky top-0 bg-white shadow-md z-20">
        <div className="container mx-auto relative px-0 sm:px-4">
          <div className="flex justify-start items-center">
            <button
              onClick={onBack}
              className="flex items-center bg-[var(--coastal-sea)] text-white hover:bg-[var(--open-sea)] transition-all duration-300 px-4 py-2 rounded-lg shadow-md hover:shadow-lg z-10 transform hover:scale-105 active:scale-98 font-workSans-medium ml-0"
            >
              <ChevronLeft size={20} className="mr-2" />
              <span className="text-sm sm:text-base">Volver a Grupos</span>
            </button>
          </div>
          
          <div className="mt-3 w-full text-center max-sm:wrap-anywhere sm:mt-0 sm:absolute sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2">
            <h1 className="text-xl sm:text-3xl font-bold text-[var(--deep-sea)]">
              {group.name}
            </h1>
            <p className="text-xs sm:text-base text-[var(--coastal-sea)] font-medium">
              Interés: {group.interest}
            </p>
          </div>
        </div>
      </header>

      <main
        ref={scrollableContainerRef}
        className="container mx-auto p-4 sm:p-6 flex-grow overflow-y-auto"
      >
        {error && <p role="alert" className="mb-4 text-center text-red-700">{error}</p>}
        {posts && posts.length > 0 ? (
          <div className="space-y-6">
            {posts.map((post) => (
              <PostItem
                key={post.id}
                post={post}
                onLike={() => onLike(group.id, post.id, !post.likedByMe)}
                onCommentSubmit={() => submitComment(post.id)}
                commentText={commentTexts[post.id] || ""}
                onCommentChange={(text) => handleCommentChange(post.id, text)}
              />
            ))}
          </div>
        ) : (
          !isLoadingMore && (
            <p className="text-center text-gray-500 text-lg mt-10">
              No hay publicaciones en este grupo todavía.
            </p>
          )
        )}
        {isLoadingMore && <LoadingSpinner />}
        {!isLoadingMore && !hasMore && posts && posts.length > 0 && (
          <p className="text-center text-gray-500 my-8">
            ¡Has llegado al final!
          </p>
        )}
      </main>
    </div>
  );
};

export default GroupView; 