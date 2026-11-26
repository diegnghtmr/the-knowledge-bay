import { useCallback, useEffect, useRef, useState } from "react";
import NavigationBar from "../components/layout/NavigationBar";
import StudyGroupsList from "../components/study-groups/StudyGroupsList";
import GroupView from "../components/study-groups/GroupView";
import LoadingSpinner from "../components/common/LoadingSpinner";
import {
  getAllGroups,
  getPostsByGroupId,
  likePost,
  addCommentToPost,
} from "../services/studyGroupApi";
import { useLocation } from 'react-router-dom';

const StudyGroupsPage = () => {
  const [allAvailableGroups, setAllAvailableGroups] = useState([]); // Store all groups fetched from API
  const [currentGroupPosts, setCurrentGroupPosts] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [postsPage, setPostsPage] = useState(0);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [error, setError] = useState(null);
  const groupIdFromState = useLocation().state?.groupId;
  const pendingPosts = useRef(null);
  const selectedGroupRef = useRef(null);

  const fetchPostsForGroup = useCallback(async (groupId, page = 0, loadMore = false) => {
    if (loadMore && pendingPosts.current) return;
    pendingPosts.current?.abort();
    const controller = new AbortController();
    pendingPosts.current = controller;
    setIsLoadingPosts(true);
    try {
      const posts = await getPostsByGroupId(groupId, page, 10, controller.signal);
      if (controller.signal.aborted) return;
      setCurrentGroupPosts(previous => loadMore ? [...previous, ...posts] : posts);
      setPostsPage(page);
      setHasMorePosts(posts.length === 10);
    } catch (error) {
      if (controller.signal.aborted) return;
      setError(error.message);
      setHasMorePosts(false);
    } finally {
      if (pendingPosts.current === controller) {
        pendingPosts.current = null;
        setIsLoadingPosts(false);
      }
    }
  }, []);

  const handleSelectGroup = useCallback((group) => {
    selectedGroupRef.current = group;
    setSelectedGroup(group);
    setCurrentGroupPosts([]);
    setPostsPage(0);
    setHasMorePosts(true);
    setError(null);
    fetchPostsForGroup(group.id);
  }, [fetchPostsForGroup]);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    getAllGroups(controller.signal).then((groups) => {
      if (controller.signal.aborted) return;
      setAllAvailableGroups(groups);
      const group = groups.find(({ id }) => id === groupIdFromState);
      if (group) handleSelectGroup(group);
      setIsLoading(false);
    });
    return () => {
      controller.abort();
      const posts = pendingPosts.current;
      pendingPosts.current = null;
      posts?.abort();
      selectedGroupRef.current = null;
    };
  }, [groupIdFromState, handleSelectGroup]);

  const handleGoBack = () => {
    const posts = pendingPosts.current;
    pendingPosts.current = null;
    posts?.abort();
    selectedGroupRef.current = null;
    setSelectedGroup(null);
    setSearchTerm("");
    setCurrentGroupPosts([]);
    setError(null);
  };

  const updatePost = (postId, update) => {
    setCurrentGroupPosts(posts => posts.map(post => post.id === postId ? update(post) : post));
  };

  const handleLikePost = async (groupId, postId, liked) => {
    const group = selectedGroupRef.current;
    setError(null);
    try {
      const result = await likePost(groupId, postId, liked);
      if (selectedGroupRef.current === group) {
        updatePost(postId, post => ({ ...post, likedByMe: result.likedByMe, likes: result.likes }));
      }
    } catch (error) {
      if (selectedGroupRef.current === group) setError(error.message);
    }
  };

  const handleAddComment = async (groupId, postId, commentText) => {
    if (!commentText.trim()) return false;
    const group = selectedGroupRef.current;
    setError(null);
    try {
      const comment = await addCommentToPost(groupId, postId, commentText);
      if (selectedGroupRef.current !== group) return false;
      updatePost(postId, post => ({ ...post, comments: [...(post.comments || []), comment] }));
      return true;
    } catch (error) {
      if (selectedGroupRef.current === group) setError(error.message);
      return false;
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
            key={selectedGroup.id}
            group={selectedGroup}
            posts={currentGroupPosts}
            error={error}
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