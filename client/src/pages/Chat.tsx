import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Phone, Video, MoreVertical, Paperclip, Image, Mic, Send } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useWebSocket } from "@/lib/websocket";
import type { ChatMessage, User } from "@shared/schema";
import FloatingNav from "@/components/FloatingNav";

export default function Chat() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { sendMessage, messages: wsMessages, isConnected } = useWebSocket(user?.id || '');

  const { data: chats = [] } = useQuery({
    queryKey: ['/api/chats'],
    refetchInterval: 5000, // Refetch every 5 seconds
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['/api/chats', selectedChat, 'messages'],
    enabled: !!selectedChat,
    refetchInterval: 2000, // Refetch every 2 seconds
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, wsMessages]);

  useEffect(() => {
    // If we have chats but no selected chat, select the first one
    if (chats.length > 0 && !selectedChat) {
      setSelectedChat(chats[0].userId);
    }
  }, [chats, selectedChat]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedChat) return;

    const messageData = {
      message: messageInput.trim(),
      receiverId: selectedChat,
    };

    try {
      await apiRequest('POST', `/api/chats/${selectedChat}/messages`, messageData);
      
      // Send via WebSocket for real-time delivery
      if (isConnected) {
        sendMessage({
          type: 'new_message',
          data: messageData
        });
      }

      setMessageInput('');
      toast({
        title: "Message sent",
        description: "Your message has been delivered",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  const formatTimestamp = (timestamp: string | Date) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const selectedChatUser = chats.find((chat: any) => chat.userId === selectedChat)?.user;

  // Mock chat data for demo purposes since we don't have real users
  const mockChats = [
    {
      userId: 'user1',
      user: {
        id: 'user1',
        firstName: 'Sarah',
        lastName: 'Johnson',
        profileImageUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b890?w=100&h=100&fit=crop&crop=face'
      },
      lastMessage: {
        message: "Hi! I saw you're interested in hair styling services. I'd love to help you with that!",
        timestamp: new Date(Date.now() - 5 * 60 * 1000) // 5 minutes ago
      },
      unreadCount: 2
    },
    {
      userId: 'user2',
      user: {
        id: 'user2',
        firstName: 'Tech',
        lastName: 'Support',
        profileImageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
      },
      lastMessage: {
        message: "Your computer issue has been resolved. Let me know if you need anything else!",
        timestamp: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
      },
      unreadCount: 0
    },
    {
      userId: 'user3',
      user: {
        id: 'user3',
        firstName: 'Delivery',
        lastName: 'Service',
        profileImageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
      },
      lastMessage: {
        message: "Your order is out for delivery and should arrive in 20 minutes",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
      },
      unreadCount: 1
    }
  ];

  const mockMessages = selectedChat ? [
    {
      id: 1,
      senderId: selectedChat,
      receiverId: user?.id,
      message: "Hi! I saw you're interested in hair styling services. I'd love to help you with that!",
      timestamp: new Date(Date.now() - 10 * 60 * 1000),
      isRead: true
    },
    {
      id: 2,
      senderId: user?.id,
      receiverId: selectedChat,
      message: "That sounds great! What are your rates for a haircut and styling?",
      timestamp: new Date(Date.now() - 9 * 60 * 1000),
      isRead: true
    },
    {
      id: 3,
      senderId: selectedChat,
      receiverId: user?.id,
      message: "Here's our price list and some examples of my work:",
      timestamp: new Date(Date.now() - 8 * 60 * 1000),
      isRead: true
    }
  ] : [];

  const currentChats = chats.length > 0 ? chats : mockChats;
  const currentMessages = messages.length > 0 ? messages : mockMessages;
  const currentSelectedUser = selectedChatUser || mockChats.find(c => c.userId === selectedChat)?.user;

  return (
    <div className="min-h-screen bg-dark-purple flex flex-col">
      {/* Mobile: Show chat list or chat view */}
      <div className="flex-1 md:hidden">
        {!selectedChat ? (
          // Chat List View (Mobile)
          <>
            <header className="bg-deep-navy border-b border-gray-700 px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setLocation('/')}
                    className="text-gray-400 hover:text-white"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <h1 className="text-xl font-bold text-white">Messages</h1>
                </div>
              </div>
            </header>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {currentChats.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-4xl text-gray-400 mb-4">
                    <i className="fas fa-comments"></i>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">No conversations yet</h3>
                  <p className="text-gray-400">Start chatting with service providers and students</p>
                </div>
              ) : (
                <div className="p-4 space-y-2">
                  {currentChats.map((chat: any) => (
                    <Card 
                      key={chat.userId}
                      className="gradient-border cursor-pointer hover:scale-[1.02] transition-all duration-300"
                      onClick={() => setSelectedChat(chat.userId)}
                    >
                      <div className="gradient-border-inner p-4">
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-12 h-12 border-2 border-neon-cyan">
                            <AvatarImage src={chat.user?.profileImageUrl} />
                            <AvatarFallback className="bg-neon-cyan text-white">
                              {chat.user?.firstName?.[0]}{chat.user?.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="text-white font-medium truncate">
                                {chat.user?.firstName} {chat.user?.lastName}
                              </h3>
                              <span className="text-gray-400 text-xs">
                                {formatTimestamp(chat.lastMessage?.timestamp)}
                              </span>
                            </div>
                            <p className="text-gray-400 text-sm truncate">
                              {chat.lastMessage?.message}
                            </p>
                          </div>
                          {chat.unreadCount > 0 && (
                            <div className="w-5 h-5 bg-cyber-red rounded-full flex items-center justify-center">
                              <span className="text-white text-xs">{chat.unreadCount}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          // Chat View (Mobile)
          <>
            {/* Chat Header */}
            <header className="bg-deep-navy border-b border-gray-700 px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setSelectedChat(null)}
                    className="text-gray-400 hover:text-white"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-10 h-10 border-2 border-neon-cyan">
                      <AvatarImage src={currentSelectedUser?.profileImageUrl} />
                      <AvatarFallback className="bg-neon-cyan text-white">
                        {currentSelectedUser?.firstName?.[0]}{currentSelectedUser?.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-white font-medium">
                        {currentSelectedUser?.firstName} {currentSelectedUser?.lastName}
                      </h3>
                      <p className="text-green-400 text-xs">Online</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" className="p-2 text-gray-400 hover:text-white">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="p-2 text-gray-400 hover:text-white">
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="p-2 text-gray-400 hover:text-white">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </header>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
              {currentMessages.map((message: any, index: number) => (
                <div key={message.id || index} className={`flex ${message.senderId === user?.id ? 'justify-end' : 'space-x-3'}`}>
                  {message.senderId !== user?.id && (
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarImage src={currentSelectedUser?.profileImageUrl} />
                      <AvatarFallback className="bg-neon-cyan text-white">
                        {currentSelectedUser?.firstName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.senderId === user?.id 
                      ? 'chat-bubble-user' 
                      : 'chat-bubble-other'
                  }`}>
                    <p className="text-white text-sm">{message.message}</p>
                    <div className={`flex items-center ${message.senderId === user?.id ? 'justify-end' : ''} space-x-1 mt-1`}>
                      <span className={`text-xs ${message.senderId === user?.id ? 'text-gray-200' : 'text-gray-400'}`}>
                        {formatTimestamp(message.timestamp)}
                      </span>
                      {message.senderId === user?.id && (
                        <i className="fas fa-check-double text-neon-cyan text-xs"></i>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex space-x-3">
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarImage src={currentSelectedUser?.profileImageUrl} />
                    <AvatarFallback className="bg-neon-cyan text-white">
                      {currentSelectedUser?.firstName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="chat-bubble-other px-4 py-2 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="bg-deep-navy border-t border-gray-700 p-4">
              <div className="flex items-center space-x-3">
                <Button variant="ghost" size="sm" className="p-2 text-gray-400 hover:text-white">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="p-2 text-gray-400 hover:text-white">
                  <Image className="h-4 w-4" />
                </Button>
                <div className="flex-1 relative">
                  <Input
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type a message..."
                    className="w-full px-4 py-3 bg-midnight-blue border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan pr-12"
                  />
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    <Mic className="h-4 w-4" />
                  </Button>
                </div>
                <Button 
                  onClick={handleSendMessage}
                  className="p-3 bg-gradient-to-r from-neon-cyan to-electric-purple text-white rounded-lg hover:from-electric-purple hover:to-neon-pink transition-all duration-300"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Desktop: Show both chat list and chat view */}
      <div className="hidden md:flex flex-1">
        {/* Chat List (Desktop) */}
        <div className="w-1/3 border-r border-gray-700 flex flex-col">
          <header className="bg-deep-navy border-b border-gray-700 px-4 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-white">Messages</h1>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setLocation('/')}
                className="text-gray-400 hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </div>
          </header>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {currentChats.length === 0 ? (
              <div className="text-center py-12 px-4">
                <div className="text-4xl text-gray-400 mb-4">
                  <i className="fas fa-comments"></i>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">No conversations</h3>
                <p className="text-gray-400 text-sm">Start chatting with others</p>
              </div>
            ) : (
              <div className="p-4 space-y-2">
                {currentChats.map((chat: any) => (
                  <div
                    key={chat.userId}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedChat === chat.userId 
                        ? 'bg-neon-cyan/20 border border-neon-cyan/30' 
                        : 'hover:bg-gray-700/50'
                    }`}
                    onClick={() => setSelectedChat(chat.userId)}
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-10 h-10 border-2 border-neon-cyan">
                        <AvatarImage src={chat.user?.profileImageUrl} />
                        <AvatarFallback className="bg-neon-cyan text-white">
                          {chat.user?.firstName?.[0]}{chat.user?.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="text-white font-medium truncate text-sm">
                            {chat.user?.firstName} {chat.user?.lastName}
                          </h3>
                          <span className="text-gray-400 text-xs">
                            {formatTimestamp(chat.lastMessage?.timestamp)}
                          </span>
                        </div>
                        <p className="text-gray-400 text-xs truncate">
                          {chat.lastMessage?.message}
                        </p>
                      </div>
                      {chat.unreadCount > 0 && (
                        <div className="w-4 h-4 bg-cyber-red rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">{chat.unreadCount}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Chat View (Desktop) */}
        <div className="flex-1 flex flex-col">
          {!selectedChat ? (
            <div className="flex-1 flex items-center justify-center bg-midnight-blue">
              <div className="text-center">
                <div className="text-4xl text-gray-400 mb-4">
                  <i className="fas fa-comments"></i>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Select a conversation</h3>
                <p className="text-gray-400">Choose a chat from the sidebar to start messaging</p>
              </div>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <header className="bg-deep-navy border-b border-gray-700 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-10 h-10 border-2 border-neon-cyan">
                      <AvatarImage src={currentSelectedUser?.profileImageUrl} />
                      <AvatarFallback className="bg-neon-cyan text-white">
                        {currentSelectedUser?.firstName?.[0]}{currentSelectedUser?.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-white font-medium">
                        {currentSelectedUser?.firstName} {currentSelectedUser?.lastName}
                      </h3>
                      <p className="text-green-400 text-xs">Online</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" className="p-2 text-gray-400 hover:text-white">
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="p-2 text-gray-400 hover:text-white">
                      <Video className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="p-2 text-gray-400 hover:text-white">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </header>

              {/* Messages Container */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
                {currentMessages.map((message: any, index: number) => (
                  <div key={message.id || index} className={`flex ${message.senderId === user?.id ? 'justify-end' : 'space-x-3'}`}>
                    {message.senderId !== user?.id && (
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarImage src={currentSelectedUser?.profileImageUrl} />
                        <AvatarFallback className="bg-neon-cyan text-white">
                          {currentSelectedUser?.firstName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div className={`max-w-md px-4 py-2 rounded-lg ${
                      message.senderId === user?.id 
                        ? 'chat-bubble-user' 
                        : 'chat-bubble-other'
                    }`}>
                      <p className="text-white text-sm">{message.message}</p>
                      <div className={`flex items-center ${message.senderId === user?.id ? 'justify-end' : ''} space-x-1 mt-1`}>
                        <span className={`text-xs ${message.senderId === user?.id ? 'text-gray-200' : 'text-gray-400'}`}>
                          {formatTimestamp(message.timestamp)}
                        </span>
                        {message.senderId === user?.id && (
                          <i className="fas fa-check-double text-neon-cyan text-xs"></i>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex space-x-3">
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarImage src={currentSelectedUser?.profileImageUrl} />
                      <AvatarFallback className="bg-neon-cyan text-white">
                        {currentSelectedUser?.firstName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="chat-bubble-other px-4 py-2 rounded-lg">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="bg-deep-navy border-t border-gray-700 p-6">
                <div className="flex items-center space-x-3">
                  <Button variant="ghost" size="sm" className="p-2 text-gray-400 hover:text-white">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="p-2 text-gray-400 hover:text-white">
                    <Image className="h-4 w-4" />
                  </Button>
                  <div className="flex-1 relative">
                    <Input
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Type a message..."
                      className="w-full px-4 py-3 bg-midnight-blue border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan pr-12"
                    />
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      <Mic className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button 
                    onClick={handleSendMessage}
                    className="p-3 bg-gradient-to-r from-neon-cyan to-electric-purple text-white rounded-lg hover:from-electric-purple hover:to-neon-pink transition-all duration-300"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <FloatingNav />
    </div>
  );
}
