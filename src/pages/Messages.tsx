import React, { useState, useRef, useEffect } from 'react';
import { Send, Search, MoreVertical, Phone, Video, Paperclip, Smile, Plus, X, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import toast from 'react-hot-toast';

const Messages = () => {
  const { user } = useAuth();
  const { interns, messages, chats, sendMessage, createChat, markMessagesAsRead } = useApp();
  const [selectedChat, setSelectedChat] = useState<string>('');
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [showChatList, setShowChatList] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Get chats for current user
  const userChats = chats.filter(chat => 
    chat.participantIds.includes(user?.id || '')
  );

  // Set default selected chat
  useEffect(() => {
    if (userChats.length > 0 && !selectedChat) {
      setSelectedChat(userChats[0].id);
    }
  }, [userChats, selectedChat]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && selectedChat && user) {
      sendMessage(selectedChat, newMessage.trim(), user.id, user.name);
      setNewMessage('');
    }
  };

  const handleStartNewChat = (internId: string) => {
    if (!user) return;
    
    const intern = interns.find(i => i.id === internId);
    if (intern) {
      // Check if chat already exists
      const existingChat = chats.find(chat => 
        chat.participantIds.includes(user.id) && chat.participantIds.includes(internId)
      );
      
      if (existingChat) {
        setSelectedChat(existingChat.id);
        toast.info('Chat already exists');
      } else {
        // Create new chat
        const participantIds = user.role === 'admin' 
          ? ['admin', internId] 
          : [user.id, 'admin'];
        const participantNames = user.role === 'admin'
          ? ['Divyansh Pansari', intern.name]
          : [user.name, 'Divyansh Pansari'];
        
        const chatId = createChat(participantIds, participantNames);
        setSelectedChat(chatId);
        toast.success(`Started chat with ${intern.name}`);
      }
    }
    setIsNewChatModalOpen(false);
  };

  const filteredChats = userChats.filter(chat =>
    chat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedChatData = chats.find(chat => chat.id === selectedChat);
  const chatMessages = messages.filter(message => message.chatId === selectedChat);

  const handleChatSelect = (chatId: string) => {
    setSelectedChat(chatId);
    setShowChatList(false); // Hide chat list on mobile when chat is selected
    if (user) {
      markMessagesAsRead(chatId, user.id);
    }
  };

  const handleBackToChats = () => {
    setShowChatList(true);
    setSelectedChat('');
  };

  // Get available users to chat with
  const availableUsers = user?.role === 'admin' 
    ? interns 
    : []; // Interns can only chat with admin, which should already exist

  return (
    <div className="h-[calc(100vh-8rem)] flex bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Chat List */}
      <div className={`${showChatList ? 'flex' : 'hidden'} lg:flex w-full lg:w-80 border-r border-gray-200 flex-col`}>
        <div className="p-4 lg:p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Messages</h1>
            {user?.role === 'admin' && (
              <button
                onClick={() => setIsNewChatModalOpen(true)}
                className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
              >
                <Plus className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredChats.map(chat => {
            const unreadCount = user ? (chat.unread[user.id] || 0) : 0;
            const otherParticipant = chat.participants.find(p => p !== user?.name) || chat.participants[0];
            const initials = otherParticipant.split(' ').map(n => n[0]).join('');
            
            return (
              <div
                key={chat.id}
                onClick={() => handleChatSelect(chat.id)}
                className={`p-3 lg:p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors duration-200 ${
                  selectedChat === chat.id ? 'bg-indigo-50 border-r-4 border-r-indigo-500' : ''
                }`}
              >
                <div className="flex items-center">
                  <div className="relative">
                    <div className="w-10 lg:w-12 h-10 lg:h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {initials}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-3 lg:w-4 h-3 lg:h-4 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>
                  <div className="ml-3 flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900 truncate text-sm lg:text-base">{otherParticipant}</h3>
                      <span className="text-xs text-gray-500">{chat.time}</span>
                    </div>
                    <p className="text-xs lg:text-sm text-gray-500 truncate mt-1">{chat.lastMessage}</p>
                  </div>
                  {unreadCount > 0 && (
                    <div className="ml-2 bg-indigo-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadCount}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          
          {filteredChats.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              <p>No conversations found</p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`${!showChatList ? 'flex' : 'hidden'} lg:flex flex-1 flex-col min-w-0`}>
        {selectedChatData ? (
          <>
            {/* Chat Header */}
            <div className="p-4 lg:p-6 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center">
                <button
                  onClick={handleBackToChats}
                  className="lg:hidden mr-3 p-2 text-gray-400 hover:text-gray-600"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="relative">
                  <div className="w-8 lg:w-10 h-8 lg:h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {selectedChatData.participants.find(p => p !== user?.name)?.split(' ').map(n => n[0]).join('') || 'U'}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-2 lg:w-3 h-2 lg:h-3 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
                <div className="ml-3">
                  <h2 className="font-semibold text-gray-900 text-sm lg:text-base">
                    {selectedChatData.participants.find(p => p !== user?.name) || selectedChatData.participants[0]}
                  </h2>
                  <p className="text-xs lg:text-sm text-gray-500">Online</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 lg:space-x-3">
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                  <Phone className="w-4 lg:w-5 h-4 lg:h-5" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                  <Video className="w-4 lg:w-5 h-4 lg:h-5" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                  <MoreVertical className="w-4 lg:w-5 h-4 lg:h-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4">
              {chatMessages.length > 0 ? (
                chatMessages.map(message => {
                  const isOwn = message.senderId === user?.id;
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className="max-w-xs lg:max-w-md">
                        <div
                          className={`px-3 lg:px-4 py-2 rounded-2xl ${
                            isOwn
                              ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                        </div>
                        <p className={`text-xs mt-1 ${isOwn ? 'text-right text-gray-500' : 'text-gray-500'}`}>
                          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <p className="text-lg font-medium">No messages yet</p>
                    <p className="text-sm">Start a conversation!</p>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 lg:p-6 border-t border-gray-200">
              <form onSubmit={handleSendMessage} className="flex items-center space-x-2 lg:space-x-3">
                <button
                  type="button"
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <Paperclip className="w-4 lg:w-5 h-4 lg:h-5" />
                </button>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="w-full px-3 lg:px-4 py-2 lg:py-3 pr-10 lg:pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm lg:text-base"
                  />
                  <button
                    type="button"
                    className="absolute right-2 lg:right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded transition-colors duration-200"
                  >
                    <Smile className="w-4 lg:w-5 h-4 lg:h-5" />
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-2 lg:p-3 rounded-xl hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <Send className="w-4 lg:w-5 h-4 lg:h-5" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <p className="text-lg font-medium">Select a conversation</p>
              <p className="text-sm">Choose a chat to start messaging</p>
            </div>
          </div>
        )}
      </div>

      {/* New Chat Modal */}
      {isNewChatModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Start New Chat</h3>
              <button
                onClick={() => setIsNewChatModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {availableUsers.map(intern => (
                <button
                  key={intern.id}
                  onClick={() => handleStartNewChat(intern.id)}
                  className="w-full flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                >
                  <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                    {intern.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">{intern.name}</p>
                    <p className="text-sm text-gray-500">{intern.role}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;