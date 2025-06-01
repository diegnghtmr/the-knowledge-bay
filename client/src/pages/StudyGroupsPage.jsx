import React, { useState, useEffect } from "react";
import NavigationBar from "../components/layout/NavigationBar";
import StudyGroupsList from "../components/study-groups/StudyGroupsList";
import GroupView from "../components/study-groups/GroupView";
import LoadingSpinner from "../components/common/LoadingSpinner";
import {
  getAllGroups,
  getPostsByGroupId,
  likePost,
  addCommentToPost,
} from "../services/studyGroupApi"; // Updated import path
import { useLocation } from 'react-router-dom'; // Import useLocation

const StudyGroupsPage = () => {
  const [allAvailableGroups, setAllAvailableGroups] = useState([]); // Store all groups fetched from API
  const [currentGroupPosts, setCurrentGroupPosts] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [postsPage, setPostsPage] = useState(0);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const location = useLocation(); // Get location object

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setIsLoading(true);
        const fetchedGroups = await getAllGroups();
        setAllAvailableGroups(fetchedGroups); // Store all fetched groups

        // Check for groupId from route state
        const groupIdFromState = location.state?.groupId;
        if (groupIdFromState && fetchedGroups.length > 0) {
          const groupToSelect = fetchedGroups.find(g => g.id === groupIdFromState);
          if (groupToSelect) {
            handleSelectGroup(groupToSelect); // Automatically select the group
          }
        }
      } catch (error) {
        console.error("Error fetching groups:", error);
        setAllAvailableGroups([]); // Ensure it's an array in case of error
      } finally {
        setIsLoading(false);
      }
    };
    fetchGroups();
  }, []);

  const fetchPostsForGroup = async (groupId, page = 0, loadMore = false) => {
    if (isLoadingPosts && loadMore) return;
    
    setIsLoadingPosts(true);
    try {
      const fetchedPosts = await getPostsByGroupId(groupId, page);
      if (fetchedPosts.length > 0) {
        setCurrentGroupPosts(prev => loadMore ? [...prev, ...fetchedPosts] : fetchedPosts);
        setPostsPage(page);
        setHasMorePosts(fetchedPosts.length === 10); 
      } else {
        if (!loadMore) { 
            setCurrentGroupPosts([]);
        }
        setHasMorePosts(false);
      }
    } catch (error) {
      console.error(`Error fetching posts for group ${groupId}:`, error);
      setHasMorePosts(false); 
    } finally {
      setIsLoadingPosts(false);
    }
  };

  const handleSelectGroup = (group) => {
    setSelectedGroup(group);
    setCurrentGroupPosts([]); 
    setPostsPage(0);        
    setHasMorePosts(true);  
    if (group) {
        // Simplification: always fetch posts for selected group for now.
        // Caching strategy can be added later if needed.
        fetchPostsForGroup(group.id, 0); 
    }
  };

  const handleGoBack = () => {
    setSelectedGroup(null);
    setSearchTerm("");
    setCurrentGroupPosts([]);
  };

  const handleLikePost = async (groupId, postId) => {
    try {
      const response = await likePost(groupId, postId);
      
      // Check if the like was successful
      if (response && response.success) {
        // Update only the like-related properties of the post
        const updatePostInState = (postsList) => 
          postsList.map((post) => {
            if (post.id === postId) {
              // Toggle the like status and update count
              const newLikedByMe = !post.likedByMe;
              const newLikeCount = newLikedByMe ? 
                (post.likes || 0) + 1 : 
                Math.max((post.likes || 0) - 1, 0);
              
              return {
                ...post,
                likedByMe: newLikedByMe,
                likes: newLikeCount
              };
            }
            return post;
          });
        
        setCurrentGroupPosts(prevPosts => updatePostInState(prevPosts));
      }

    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const handleAddComment = async (groupId, postId, commentText) => {
    if (!commentText.trim()) return;
    try {
      const newComment = await addCommentToPost(groupId, postId, commentText);
      const updatePostInState = (postsList) => postsList.map((post) => {
        if (post.id === postId) {
          return { ...post, comments: [...(post.comments || []), newComment] };
        }
        return post;
      });
      
      setCurrentGroupPosts(prevPosts => updatePostInState(prevPosts));

    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const fetchMoreGroupPosts = () => {
    if (selectedGroup && hasMorePosts && !isLoadingPosts) {
      fetchPostsForGroup(selectedGroup.id, postsPage + 1, true);
    }
  };

  // Filter groups based on searchTerm from allAvailableGroups
  const filteredGroups = allAvailableGroups.filter(
    (group) =>
      (group.name && group.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (group.interest && group.interest.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (isLoading) {
    return (
        <div className="flex flex-col min-h-screen bg-white">
            <NavigationBar title="Grupos de Estudio" />
            <div className="flex-grow flex items-center justify-center">
                 {/* Using existing LoadingSpinner component */}
                <LoadingSpinner message="Cargando grupos..." />
            </div>
        </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <NavigationBar title="Grupos de Estudio" />
      
      <div className="flex-grow">
        {selectedGroup ? (
          <GroupView
            group={selectedGroup}
            posts={currentGroupPosts}
            onBack={handleGoBack}
            onLike={handleLikePost}
            onComment={handleAddComment}
            fetchMore={fetchMoreGroupPosts}
            hasMore={hasMorePosts}
            isLoadingMore={isLoadingPosts}
          />
        ) : (
          <StudyGroupsList
            groups={filteredGroups} // Pass the client-side filtered groups
            onSelectGroup={handleSelectGroup}
            searchTerm={searchTerm}
            onSearchChange={(e) => setSearchTerm(e.target.value)}
            originalGroupsCount={allAvailableGroups.length} // Pass the count of all groups
          />
        )}
      </div>

      <footer className="w-full py-6 bg-[var(--deep-sea)] text-white">
        <div className="container mx-auto text-center">
          <p>The Knowledge Bay - Una red social académica.</p>
        </div>
      </footer>
    </div>
  );
};

export default StudyGroupsPage; 