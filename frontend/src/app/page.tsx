'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import ComponentRenderer from '@/components/page/ComponentRenderer';
import { executeGraphQLQuery } from '@/lib/graphql';
import { PageResponse, Post, UserProfile, FollowedUser, PostType, TextPost } from '@/types';
import { GET_CURRENT_PAGE, GET_CURRENT_POSTS, GET_PAGE, GET_USER, GET_USER_POSTS, GET_USERS_FOLLOWED } from '@/graphql/queries';
import { PostRenderer } from '@/components/page/PostRenderer';
import { SEARCH_USERS } from '@/graphql/queries';
import { exec } from 'child_process';
import { ADD_COMPONENT, CREATE_TEXT_POST, DELETE_COMPONENT, FOLLOW_USER, UNFOLLOW_USER } from '@/graphql/mutations';

function MainPageContent() {
  const { user, signOut } = useAuth();

  // --- Your page/journal ---
  const [pageData, setPageData] = useState<PageResponse | null>(null);
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'page' | 'journal'>('page');

  // --- Open Page Customizer ---
  const [customizerOpen, setCustomizerOpen] = useState(false);
  const [componentMenuOpen, setComponentMenuOpen] = useState(false);

  // --- Open Create Post Menu ---
  const [postMenuOpen, setPostMenuOpen] = useState(false);

  const [addTextPostMenuOpen, setAddTextPostMenuOpen] = useState(false);
  const [textInput, setTextInput] = useState("");

  // --- Search / sidebar ---
  const [activeMenu, setActiveMenu] = useState<'default' | 'searchUsers' | 'followedUsers'>('default');

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[] | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const [followedList, setFollowedList] = useState<FollowedUser[] | null>(null);
  const [followedLoading, setFollowedLoading] = useState(false);
  const [followedError, setfollowedError] = useState<string | null>(null);

  // --- Selected user page ---
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [userPage, setUserPage] = useState<PageResponse | null>(null);
  const [userPosts, setUserPosts] = useState<Post[] | null>(null);
  const [loadingUserData, setLoadingUserData] = useState(false);
  const [userDataError, setUserDataError] = useState<string | null>(null);

  // --- Load your own page/journal ---
  useEffect(() => {
    setCustomizerOpen(false);
    setPostMenuOpen(false);

    if (activeTab === 'page') fetchCurrentPage();
    else if (activeTab === 'journal') fetchPosts();
  }, [activeTab]);

  const fetchCurrentPage = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await executeGraphQLQuery<{ getCurrentPage: PageResponse }>({ query: GET_CURRENT_PAGE });
      setPageData(data.getCurrentPage);
    } catch (err) {
      const errorMessage = (err as Error)?.message || 'Failed to fetch page';
      console.error(err)
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await executeGraphQLQuery<{ getCurrentPosts: Post[] }>({ query: GET_CURRENT_POSTS });
      setPosts(data.getCurrentPosts);
    } catch (err) {
      const errorMessage = (err as Error)?.message || 'Failed to load posts';
      console.error(err)
    } finally {
      setLoading(false);
    }
  };

  // --- Search users ---
  const fetchSearchResults = async (query: string) => {
    if (!query) {
      setSearchResults(null);
      return;
    }

    setSearchLoading(true);
    setSearchError(null);

    try {
      const data = await executeGraphQLQuery<{ searchUsers: UserProfile[] }>({ query: SEARCH_USERS, variables: { query: query } });

      setSearchResults(data.searchUsers.filter(currUser => currUser.uuid != user?.userId));

    } catch (err) {
      const errorMessage = (err as Error)?.message || 'Failed to fetch users';
      setSearchError(errorMessage);
      console.error(err);
    } finally {
      setSearchLoading(false);
    }
  };

  // Debounce search input
  useEffect(() => {
    const delay = setTimeout(() => fetchSearchResults(searchQuery), 300);
    return () => clearTimeout(delay);
  }, [searchQuery]);

  // --- Load selected user's page/journal ---
  const fetchUserData = async (sub: string) => {
    setLoadingUserData(true);
    setUserDataError(null);
    try {

      const user = (await executeGraphQLQuery<{ getUser: UserProfile }>({ query: GET_USER, variables: { sub: sub } })).getUser;

      const pageData = await executeGraphQLQuery<{ getPage: PageResponse }>({ query: GET_PAGE, variables: { sub: user.uuid } });
      console.log(pageData);
      setUserPage(pageData.getPage);
      setCustomizerOpen(false);

      const postsData = await executeGraphQLQuery<{ getUserPosts: Post[] }>({ query: GET_USER_POSTS, variables: { sub: user.uuid } });
      setUserPosts(postsData.getUserPosts);

      setSelectedUser(user);
      setActiveTab('page'); // default to page view

    } catch (err) {
      const errorMessage = (err as Error)?.message || 'Failed to load user data';
      setError(errorMessage);
      console.error(err);
    } finally {
      setLoadingUserData(false);
    }
  };

  const fetchFollowedList = async () => {
    console.log('loading');
    setfollowedError(null);

    try {
      const followedData = await executeGraphQLQuery<({ getUsersFollowed: FollowedUser[] })>({ query: GET_USERS_FOLLOWED });
      console.log(followedData)

      setFollowedList(followedData.getUsersFollowed);
    } catch (err) {
      const errorMessage = (err as Error)?.message || 'Failed to fetch following';
      setfollowedError(errorMessage);
      console.error(err);
    } finally {
      setSearchLoading(false);
    }
  }

  const handleFollowChange = async (sub: string, following: boolean) => {
    try {
      if (!following) {
        const followUser = (await executeGraphQLQuery<({ followUser: UserProfile })>({ query: FOLLOW_USER, variables: { userId: sub } })).followUser;

        const newFollow: FollowedUser = {
          createdAt: followUser.createdAt,
          updatedAt: followUser.updatedAt,
          followingUsername: followUser.username,
          followingDisplayName: followUser.displayName,
          followingSub: followUser.uuid
        }

        if (!followedList) setFollowedList([]);

        setFollowedList(prev => prev ? [...prev, newFollow] : [newFollow]);
      }
      else {
        const unfollowUser = (await executeGraphQLQuery<({ unfollowUser: UserProfile })>({ query: UNFOLLOW_USER, variables: { userId: sub } })).unfollowUser;

        setFollowedList(prev => prev ? prev.filter(u => u.followingSub !== sub) : []);
      }
    } catch (err) {
      const errorMessage = (err as Error)?.message || 'Failed to change following status ';
      setError(errorMessage);
      console.error(err);
    }
  }

  const createTextPost = async (text: string) => {
    try {
      const newPost = (await executeGraphQLQuery<{ createTextPost: TextPost }>({ query: CREATE_TEXT_POST, variables: { text: text } })).createTextPost;

      setPosts(prev => prev ? [newPost, ...prev]: [newPost]);

    } catch (err) {
      const errorMessage = (err as Error)?.message || 'Failed to create text post ';
      setError(errorMessage);
      console.error(err);
    }
  }

  const addComponent = async (type: string) => {
    setLoadingUserData(true);
    setUserDataError(null);
    try {
      const pageData = await executeGraphQLQuery<{ addPageComponent: PageResponse }>({ query: ADD_COMPONENT, variables: { type: type } });
      console.log(pageData);
      console.log(pageData.addPageComponent);
      setPageData(pageData.addPageComponent);
      setComponentMenuOpen(false);
    } catch (err) {
      const errorMessage = (err as Error)?.message || 'Failed to add component ';
      setError(errorMessage);
      console.error(err);
    } finally {
      setLoadingUserData(false);
    }
  }

  const deleteComponent = async (id: string) => {
    setLoadingUserData(true);
    setUserDataError(null);
    try {
      const pageData = await executeGraphQLQuery<{ removePageComponent: PageResponse }>({ query: DELETE_COMPONENT, variables: { componentId: id } });
      console.log(pageData);
      console.log(pageData.removePageComponent);
      setPageData(pageData.removePageComponent);
    } catch (err) {
      const errorMessage = (err as Error)?.message || 'Failed to delete component';
      setError(errorMessage);
      console.error(err);
    } finally {
      setLoadingUserData(false);
    }
  }

  // --- Sidebar / Search ---
  const renderSidebarOrSearch = () => {
    if (activeMenu === 'searchUsers') {
      return (
        <>
          <button
            className="text-xl font-bold mb-4 self-start cursor-pointer rounded px-1 hover:bg-[var(--color-baby-powder)] hover:shadow-md transition hover:-translate-y-0.5 active:translate-y-0.5 transition-all duration-200"
            onClick={() => setActiveMenu('default')}
          >
            ←
          </button>
          <input
            type="text"
            className="w-full border rounded px-3 py-2 text-sm mb-4 bg-[var(--color-baby-powder)]"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <div className="flex-1 overflow-auto">
            {searchLoading && <p className="text-black-500 px-1 text-md mb-4 drop-shadow-sm">Searching...</p>}
            {!searchLoading && searchResults?.length === 0 && searchQuery && <p className="text-black-500 px-1 text-md drop-shadow-sm">No users found.</p>}
            {searchError && <p className="text-black-500 text-sm">{searchError}</p>}
            {searchResults?.map((u) => (
              <div
                key={u.uuid}
                className="border-b bg-[var(--color-baby-powder)] mb-4 border-[var(--color-raisin-black)] py-2 px-2 hover:bg-gray-100 rounded cursor-pointer shadow-md"
                onClick={() => fetchUserData(u.uuid)}
              >
                {/* Display name */}
                <p className={`${selectedUser?.uuid === u.uuid ? "font-bold" : "font-medium"}`}>
                  {u.displayName}
                </p>

                {/* Username on a line below */}
                <p className="text-sm text-gray-500">
                  @{u.username}
                </p>
              </div>
            ))}
          </div>
        </>
      );
    }

    else if (activeMenu === 'followedUsers') {

      return (
        <>
          <button
            className="text-xl font-bold mb-4 self-start cursor-pointer rounded px-1 hover:bg-[var(--color-baby-powder)] hover:shadow-md transition hover:-translate-y-0.5 active:translate-y-0.5 transition-all duration-200"
            onClick={() => setActiveMenu('default')}
          >
            ←
          </button>

          <div className="flex-1 overflow-auto">
            {followedLoading && <p className="text-black-500 text-sm mb-4 drop-shadow-sm ">Loading...</p>}
            {!followedLoading && followedList?.length === 0 && <p className="px-1 text-black-500 text-md drop-shadow-sm ">No followed users.</p>}
            {followedError && <p className="text-black-500 text-sm">{followedError}</p>}
            {followedList?.map((u) => (
              <div
                key={u.followingSub}
                className="border-b bg-[var(--color-baby-powder)] mb-4 border-[var(--color-raisin-black)] py-2 px-2 hover:bg-gray-100 rounded cursor-pointer shadow-md"
                onClick={() => fetchUserData(u.followingSub)}
              >
                {/* Display name */}
                <p className={`${selectedUser?.uuid === u.followingSub ? "font-bold" : "font-medium"}`}>
                  {u.followingDisplayName}
                </p>

                {/* Username on a line below */}
                <p className="text-sm text-gray-500">
                  @{u.followingUsername}
                </p>
              </div>
            ))}
          </div>
        </>
      );
    }

    return (
      <>
        <h2 className="text-2xl font-bold text-[var(--color-baby-powder)] drop-shadow-md mb-6">Menu</h2>
        <ul className="space-y-2 text-black-700 text-md flex-1">
          <li
            className={`hover:bg-[var(--color-baby-powder)] hover:shadow-md rounded p-2 cursor-pointer ${activeMenu === "default" && !selectedUser ? "bg-[var(--color-baby-powder)] font-bold shadow-md transition hover:-translate-y-0.5 active:translate-y-0.5 transition-all duration-200" : ""
              }`}
            onClick={() => {
              setActiveMenu('default');
              setSelectedUser(null);
            }}
          >
            Your Page
          </li>
          <li
            className="hover:bg-[var(--color-baby-powder)] hover:shadow-md rounded p-2 cursor-pointer transition hover:-translate-y-0.5 active:translate-y-0.5 transition-all duration-200"
            onClick={() => setActiveMenu('followedUsers')}
          >
            Following
          </li>
          <li
            className="hover:bg-[var(--color-baby-powder)] hover:shadow-md rounded p-2 cursor-pointer transition hover:-translate-y-0.5 active:translate-y-0.5 transition-all duration-200"
            onClick={() => setActiveMenu('searchUsers')}
          >
            Search Users
          </li>
          {/* <li className="hover:bg-[var(--color-baby-powder)] hover:shadow-md rounded p-2 cursor-pointer">Settings</li> */}
        </ul>
      </>
    );
  };

  // Load followed users when followed/search users is clicked and users have not yet been loaded
  useEffect(() => {
    if (["followedUsers", "searchUsers"].includes(activeMenu) && followedList === null && !followedLoading) {
      fetchFollowedList();
    }
  }, [activeMenu, followedList, followedLoading]);

  const renderAddComponentMenu = () => {
    return (
      <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center">
        <div className="bg-[var(--color-baby-powder)] rounded-lg shadow-xl p-6 w-80 flex flex-col space-y-4">
          <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">Add a Component</h2>

          <button
            onClick={() => addComponent('BIO')}
            className="w-full rounded-lg p-4 bg-[var(--color-bright-pink-crayola)] text-white font-bold hover:bg-[var(--color-eggplant)] transition cursor-pointer shadow-md"
          >
            Add Bio Component
          </button>

          <button
            onClick={() => addComponent('TEXT')}
            className="w-full rounded-lg p-4 bg-[var(--color-bright-pink-crayola)] text-white font-bold hover:bg-[var(--color-eggplant)] transition cursor-pointer shadow-md"
          >
            Add Text Component
          </button>

          <button
            onClick={() => setComponentMenuOpen(false)}
            className="mt-2 text-gray-700 text-sm underline hover:text-gray-900 cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  const renderAddTextPostMenu = () => {

    const handleSubmit = () => {
      if (textInput.trim()) {
        createTextPost(textInput);
        setTextInput(""); // Clear input
        setAddTextPostMenuOpen(false);
        setPostMenuOpen(false); // Close menu
      }
    };

    return (
      <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center">
        <div className="bg-[var(--color-baby-powder)] rounded-lg shadow-xl p-6 w-80 flex flex-col space-y-4">
          <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">Post a Text Entry</h2>

          {/* Textarea for user input */}
          <textarea
            className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-bright-pink-crayola)]"
            placeholder="Write your post here..."
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
          />

          {/* Submit button */}
          <button
            onClick={handleSubmit}
            className="w-full rounded-lg p-3 bg-[var(--color-bright-pink-crayola)] text-white font-bold hover:bg-[var(--color-eggplant)] transition cursor-pointer shadow-md"
          >
            Post
          </button>

          {/* Cancel button */}
          <button
            onClick={() => setAddTextPostMenuOpen(false)}
            className="mt-2 text-gray-700 text-sm underline hover:text-gray-900 cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  };


  useEffect(() => {
    if (componentMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [componentMenuOpen]);

  const renderPostMenu = () => {

  }

  // --- Main content ---
  const renderMainContent = () => {
    if (loading || loadingUserData) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">Loading...</div>
        </div>
      );
    }

    if (error) return <p className="text-red-500">{error}</p>;
    if (userDataError) return <p className="text-red-500">{userDataError}</p>;

    const currentPage = selectedUser ? userPage : pageData;
    const currentPosts = selectedUser ? userPosts : posts;

    const isFollowing = !!(selectedUser && followedList && followedList.some(user => user.followingSub === selectedUser.uuid));

    // Show whose page it is
    const pageOwner = selectedUser ? selectedUser.displayName + "'s" : 'Your';

    if (activeTab === 'page') {
      if (!currentPage) return <p>No page data.</p>;
      const sortedComponents = [...currentPage.components].sort((a, b) => a.order - b.order);

      return (
        <div>
          <div className="flex items-center space-x-4 mb-2">
            <div className="text-gray-700 py-2 font-bold">{pageOwner} Page</div>

            {selectedUser && (
              <button
                className={`group rounded-lg shadow-md w-24 font-bold transition cursor-pointer px-4 py-1
                            flex justify-center items-center
                              ${isFollowing
                    ? "bg-[var(--color-celeste)] text-gray-900 hover:bg-[var(--color-bright-pink-crayola)]"
                    : "bg-[var(--color-bright-pink-crayola)] text-gray-900 hover:bg-[var(--color-celeste)]"
                  }`}
                onClick={(() => handleFollowChange(selectedUser.uuid, isFollowing))}
              >
                {!isFollowing ? (
                  "Follow"
                ) : (
                  <>
                    <span className="group-hover:hidden">Following</span>
                    <span className="hidden group-hover:inline">Unfollow</span>
                  </>
                )}
              </button>
            )}

          </div>

          {sortedComponents.length > 0 ? (
            <div className="space-y-4">
              {sortedComponents.map((c) => (
                <ComponentRenderer key={c.uuid}
                  component={c}
                  customizerOpen={customizerOpen}
                  onDelete={() => deleteComponent(c.uuid)}
                />
              ))}
            </div>
          ) : (
            <p className="mb-4">No components yet.</p>
          )}

          {customizerOpen && (
            <button
              onClick={() => setComponentMenuOpen(true)}
              className="w-full rounded-lg shadow-md p-6 mb-4 bg-[var(--color-baby-powder)] border-2 text-gray-900 text-center font-bold hover:bg-gray-200 transition cursor-pointer">
              Add a component!
            </button>
          )}

          {!selectedUser && (<button className={`
              fixed bottom-6 right-6 
              w-20 h-20 
              rounded-full
              ${customizerOpen ? "bg-[var(--color-eggplant)]" : "bg-[var(--color-bright-pink-crayola)]"}
              text-white text-4xl font-bold leading-none 
              flex items-center justify-center
              shadow-lg 
              hover:bg-[var(--color-celeste)] hover:text-[var(--color-bright-pink-crayola)] 
              hover:-translate-y-1 active:translate-y-0.5 
              transition-all duration-200
              cursor-pointer
            `}
            onClick={() => setCustomizerOpen(!customizerOpen)}
          >
            <span className="drop-shadow-lg relative -top-0.5">{customizerOpen ? "×" : "+"}</span>
          </button>
          )}

        </div>
      );
    } else if (activeTab === 'journal') {
      return (
        <div>

          {(!currentPosts || currentPosts.length === 0) && (<div>
            <div className="mb-4 text-gray-700 font-bold">{pageOwner} Journal</div>
            <p>No posts.</p>
          </div>
          )}

          {currentPosts && (
            <div className="space-y-4">
              {currentPosts.map((post) => (
                <PostRenderer key={post.uuid} post={post} />
              ))}
            </div>
          )}

          {/* Floating menu button */}
          {!selectedUser && (
            <div className="fixed bottom-6 right-6">
              {/* Relative container to position menu above the button */}
              <div className="relative flex flex-col items-center">
                {/* Menu options, absolutely positioned above the button */}
                {postMenuOpen && (
                  <div className="absolute bottom-full mb-2 flex flex-col items-center space-y-2">
                    <button
                      className="w-28 px-4 py-2 rounded-lg bg-[var(--color-bright-pink-crayola)] text-white font-bold shadow-md hover:bg-[var(--color-celeste)] hover:text-[var(--color-bright-pink-crayola)] transition hover:-translate-y-1 active:translate-y-0.5 transition-all duration-200 cursor-pointer"
                      onClick={() => setAddTextPostMenuOpen(true)}
                    >
                      Text Post
                    </button>
                  </div>
                )}

                {/* Main circle button */}
                <button
                  className={`
                    w-20 h-20 rounded-full 
                    ${postMenuOpen ? "bg-[var(--color-eggplant)]" : "bg-[var(--color-bright-pink-crayola)]"} 
                    text-white text-4xl font-bold leading-none 
                    flex items-center justify-center
                    shadow-lg 
                    hover:bg-[var(--color-celeste)] hover:text-[var(--color-bright-pink-crayola)] 
                    hover:-translate-y-1 active:translate-y-0.5 
                    transition-all duration-200
                    cursor-pointer
                  `}
                  onClick={() => setPostMenuOpen(!postMenuOpen)}
                >
                  <span className="drop-shadow-lg relative -top-0.5">{postMenuOpen ? "×" : "+"}</span>
                </button>
              </div>
            </div>
          )}

        </div>
      );
    }
  };

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 fixed h-screen flex-shrink-0 bg-[var(--color-bright-pink-crayola)] shadow-md z-20 p-4 flex flex-col ">
        {renderSidebarOrSearch()}
        <div className="absolute top-0 left-full h-full w-4 pointer-events-none bg-gradient-to-r from-black/11 to-transparent"></div>
      </aside>
      
      <div className="flex-1 flex flex-col ml-64">
        {/* Header */}
        <header className="bg-[var(--color-baby-powder)] shadow-md backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10 flex justify-between items-center h-16 px-6 ">
          <div className="flex items-center space-x-10">
            <button
              className={`text-2xl font-bold cursor-pointer ${activeTab === 'page' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-900 transition hover:-translate-y-0.5 active:translate-y-0.5 transition-all duration-200 cursor-pointer'
                }`}
              onClick={() => setActiveTab('page')}
            >
              Page
            </button>
            <button
              className={`text-2xl font-bold cursor-pointer ${activeTab === 'journal' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-900 transition hover:-translate-y-0.5 active:translate-y-0.5 transition-all duration-200 cursor-pointer'
                }`}
              onClick={() => setActiveTab('journal')}
            >
              Journal
            </button>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-md text-black-600">{user?.username}</span>
            <button
              onClick={signOut}
              className="bg-[var(--color-eggplant)] text-white px-3 py-1 rounded text-sm hover:bg-red-700 cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </header>

        {componentMenuOpen && renderAddComponentMenu()}
        {addTextPostMenuOpen && renderAddTextPostMenu()}

        <main className="flex-1 overflow-auto p-6">{renderMainContent()}</main>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <ProtectedRoute>
      <MainPageContent />
    </ProtectedRoute>
  );
}
