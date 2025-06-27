import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { 
  internService, 
  taskService, 
  performanceService, 
  attendanceService, 
  messageService, 
  chatService,
  settingsService
} from '../services/firebaseService';
import toast from 'react-hot-toast';

interface Intern {
  id: string;
  name: string;
  email: string;
  phone: string;
  skills: string[];
  role: string;
  joinDate: string;
  status: string;
  uid: string;
}

interface Task {
  id: string;
  title: string;
  assignedTo: string;
  assignedToId: string;
  deadline: string;
  status: 'To Do' | 'In Progress' | 'Completed';
  priority: 'High' | 'Medium' | 'Low';
}

interface Performance {
  id: string;
  internId: string;
  rating: number;
  tasksCompleted: number;
  lastReview: string;
  feedback: string;
}

interface Attendance {
  id: string;
  internId: string;
  date: string;
  status: 'Present' | 'Absent' | 'Half Day' | 'Leave';
  checkIn?: string;
  checkOut?: string;
  notes?: string;
}

interface Message {
  id: string;
  chatId: string;
  sender: string;
  senderId: string;
  content: string;
  timestamp: any;
  isOwn: boolean;
}

interface Chat {
  id: string;
  participants: string[];
  participantIds: string[];
  name: string;
  lastMessage: string;
  time: string;
  unread: { [userId: string]: number };
  isGroup?: boolean;
}

interface AppContextType {
  interns: Intern[];
  tasks: Task[];
  performances: Performance[];
  attendance: Attendance[];
  messages: Message[];
  chats: Chat[];
  theme: string;
  loading: boolean;
  addIntern: (intern: Omit<Intern, 'id' | 'status' | 'joinDate' | 'uid'>) => Promise<void>;
  updateIntern: (id: string, intern: Partial<Intern>) => Promise<void>;
  deleteIntern: (id: string) => Promise<void>;
  addTask: (task: Omit<Task, 'id'>) => Promise<void>;
  updateTask: (id: string, task: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  updateTaskStatus: (taskId: string, status: Task['status']) => Promise<void>;
  addPerformanceReview: (review: Omit<Performance, 'id'>) => Promise<void>;
  updatePerformanceReview: (id: string, review: Partial<Performance>) => Promise<void>;
  deletePerformanceReview: (id: string) => Promise<void>;
  addAttendance: (attendance: Omit<Attendance, 'id'>) => Promise<void>;
  updateAttendance: (id: string, attendance: Partial<Attendance>) => Promise<void>;
  deleteAttendance: (id: string) => Promise<void>;
  getInternAttendance: (internId: string) => Attendance[];
  sendMessage: (chatId: string, content: string, senderId: string, senderName: string) => Promise<void>;
  createChat: (participantIds: string[], participantNames: string[]) => Promise<string>;
  markMessagesAsRead: (chatId: string, userId: string) => Promise<void>;
  setTheme: (theme: string) => void;
  getInternByEmail: (email: string) => Intern | undefined;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [theme, setThemeState] = useState<string>('light');
  const [interns, setInterns] = useState<Intern[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [performances, setPerformances] = useState<Performance[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);

  // Load all data from Firebase
  const loadData = async () => {
    try {
      setLoading(true);
      
      const [
        internsResult,
        tasksResult,
        performancesResult,
        attendanceResult,
        chatsResult
      ] = await Promise.all([
        internService.getAllInterns(),
        taskService.getAllTasks(),
        performanceService.getAllPerformances(),
        attendanceService.getAllAttendance(),
        chatService.getAllChats()
      ]);

      if (internsResult.success) setInterns(internsResult.data);
      if (tasksResult.success) setTasks(tasksResult.data);
      if (performancesResult.success) setPerformances(performancesResult.data);
      if (attendanceResult.success) setAttendance(attendanceResult.data);
      if (chatsResult.success) setChats(chatsResult.data);

      // Load user settings
      if (user) {
        const settingsResult = await settingsService.getSettings(user.uid);
        if (settingsResult.success && settingsResult.data.theme) {
          setThemeState(settingsResult.data.theme);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Initialize data when user changes
  useEffect(() => {
    if (user) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [user]);

  // Apply theme
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Save theme to Firebase if user is logged in
    if (user) {
      settingsService.updateSettings(user.uid, { theme });
    }
  }, [theme, user]);

  const refreshData = async () => {
    await loadData();
  };

  const addIntern = async (internData: Omit<Intern, 'id' | 'status' | 'joinDate' | 'uid'>) => {
    try {
      const result = await internService.createIntern({
        ...internData,
        joinDate: new Date().toISOString().split('T')[0],
        status: 'Active',
        password: 'intern123'
      });
      
      if (result.success) {
        await refreshData();
        toast.success(`Intern added successfully! Login credentials: ${internData.email} / intern123`);
      } else {
        toast.error(result.error || 'Failed to add intern');
      }
    } catch (error) {
      console.error('Error adding intern:', error);
      toast.error('Failed to add intern');
    }
  };

  const updateIntern = async (id: string, internData: Partial<Intern>) => {
    try {
      const result = await internService.updateIntern(id, internData);
      if (result.success) {
        await refreshData();
        toast.success('Intern updated successfully!');
      } else {
        toast.error(result.error || 'Failed to update intern');
      }
    } catch (error) {
      console.error('Error updating intern:', error);
      toast.error('Failed to update intern');
    }
  };

  const deleteIntern = async (id: string) => {
    try {
      const result = await internService.deleteIntern(id);
      if (result.success) {
        await refreshData();
        toast.success('Intern deleted successfully!');
      } else {
        toast.error(result.error || 'Failed to delete intern');
      }
    } catch (error) {
      console.error('Error deleting intern:', error);
      toast.error('Failed to delete intern');
    }
  };

  const addTask = async (taskData: Omit<Task, 'id'>) => {
    try {
      const result = await taskService.createTask(taskData);
      if (result.success) {
        await refreshData();
        toast.success('Task added successfully!');
      } else {
        toast.error(result.error || 'Failed to add task');
      }
    } catch (error) {
      console.error('Error adding task:', error);
      toast.error('Failed to add task');
    }
  };

  const updateTask = async (id: string, taskData: Partial<Task>) => {
    try {
      const result = await taskService.updateTask(id, taskData);
      if (result.success) {
        await refreshData();
        toast.success('Task updated successfully!');
      } else {
        toast.error(result.error || 'Failed to update task');
      }
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    }
  };

  const deleteTask = async (id: string) => {
    try {
      const result = await taskService.deleteTask(id);
      if (result.success) {
        await refreshData();
        toast.success('Task deleted successfully!');
      } else {
        toast.error(result.error || 'Failed to delete task');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    }
  };

  const updateTaskStatus = async (taskId: string, status: Task['status']) => {
    try {
      const result = await taskService.updateTask(taskId, { status });
      if (result.success) {
        await refreshData();
        toast.success('Task status updated!');
      } else {
        toast.error(result.error || 'Failed to update task status');
      }
    } catch (error) {
      console.error('Error updating task status:', error);
      toast.error('Failed to update task status');
    }
  };

  const addPerformanceReview = async (reviewData: Omit<Performance, 'id'>) => {
    try {
      const result = await performanceService.createPerformance(reviewData);
      if (result.success) {
        await refreshData();
        toast.success('Performance review added successfully!');
      } else {
        toast.error(result.error || 'Failed to add performance review');
      }
    } catch (error) {
      console.error('Error adding performance review:', error);
      toast.error('Failed to add performance review');
    }
  };

  const updatePerformanceReview = async (id: string, reviewData: Partial<Performance>) => {
    try {
      const result = await performanceService.updatePerformance(id, reviewData);
      if (result.success) {
        await refreshData();
        toast.success('Performance review updated successfully!');
      } else {
        toast.error(result.error || 'Failed to update performance review');
      }
    } catch (error) {
      console.error('Error updating performance review:', error);
      toast.error('Failed to update performance review');
    }
  };

  const deletePerformanceReview = async (id: string) => {
    try {
      const result = await performanceService.deletePerformance(id);
      if (result.success) {
        await refreshData();
        toast.success('Performance review deleted successfully!');
      } else {
        toast.error(result.error || 'Failed to delete performance review');
      }
    } catch (error) {
      console.error('Error deleting performance review:', error);
      toast.error('Failed to delete performance review');
    }
  };

  const addAttendance = async (attendanceData: Omit<Attendance, 'id'>) => {
    try {
      const result = await attendanceService.createAttendance(attendanceData);
      if (result.success) {
        await refreshData();
        toast.success('Attendance marked successfully!');
      } else {
        toast.error(result.error || 'Failed to mark attendance');
      }
    } catch (error) {
      console.error('Error marking attendance:', error);
      toast.error('Failed to mark attendance');
    }
  };

  const updateAttendance = async (id: string, attendanceData: Partial<Attendance>) => {
    try {
      const result = await attendanceService.updateAttendance(id, attendanceData);
      if (result.success) {
        await refreshData();
        toast.success('Attendance updated successfully!');
      } else {
        toast.error(result.error || 'Failed to update attendance');
      }
    } catch (error) {
      console.error('Error updating attendance:', error);
      toast.error('Failed to update attendance');
    }
  };

  const deleteAttendance = async (id: string) => {
    try {
      const result = await attendanceService.deleteAttendance(id);
      if (result.success) {
        await refreshData();
        toast.success('Attendance deleted successfully!');
      } else {
        toast.error(result.error || 'Failed to delete attendance');
      }
    } catch (error) {
      console.error('Error deleting attendance:', error);
      toast.error('Failed to delete attendance');
    }
  };

  const getInternAttendance = (internId: string) => {
    return attendance.filter(record => record.internId === internId);
  };

  const sendMessage = async (chatId: string, content: string, senderId: string, senderName: string) => {
    try {
      const result = await messageService.sendMessage({
        chatId,
        sender: senderName,
        senderId,
        content,
        timestamp: new Date(),
        isOwn: true
      });

      if (result.success) {
        // Update chat's last message
        await chatService.updateChat(chatId, {
          lastMessage: content,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
        
        await refreshData();
      } else {
        toast.error(result.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const createChat = async (participantIds: string[], participantNames: string[]): Promise<string> => {
    try {
      const chatData = {
        participants: participantNames,
        participantIds,
        name: participantNames.find(name => name !== user?.name) || participantNames[0],
        lastMessage: 'No messages yet',
        time: 'Now',
        unread: participantIds.reduce((acc, id) => ({ ...acc, [id]: 0 }), {}),
      };

      const result = await chatService.createChat(chatData);
      if (result.success) {
        await refreshData();
        return result.id;
      }
      throw new Error(result.error);
    } catch (error) {
      console.error('Error creating chat:', error);
      toast.error('Failed to create chat');
      return '';
    }
  };

  const markMessagesAsRead = async (chatId: string, userId: string) => {
    try {
      const chat = chats.find(c => c.id === chatId);
      if (chat) {
        const updatedUnread = { ...chat.unread, [userId]: 0 };
        await chatService.updateChat(chatId, { unread: updatedUnread });
        await refreshData();
      }
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const setTheme = (newTheme: string) => {
    setThemeState(newTheme);
  };

  const getInternByEmail = (email: string): Intern | undefined => {
    return interns.find(intern => intern.email.toLowerCase().trim() === email.toLowerCase().trim());
  };

  return (
    <AppContext.Provider value={{
      interns,
      tasks,
      performances,
      attendance,
      messages,
      chats,
      theme,
      loading,
      addIntern,
      updateIntern,
      deleteIntern,
      addTask,
      updateTask,
      deleteTask,
      updateTaskStatus,
      addPerformanceReview,
      updatePerformanceReview,
      deletePerformanceReview,
      addAttendance,
      updateAttendance,
      deleteAttendance,
      getInternAttendance,
      sendMessage,
      createChat,
      markMessagesAsRead,
      setTheme,
      getInternByEmail,
      refreshData,
    }}>
      {children}
    </AppContext.Provider>
  );
};