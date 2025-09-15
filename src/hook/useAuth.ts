// client/src/hooks/useAuth.ts
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../redux/store';
import { setUser } from '../redux/slices/AuthSlice';
import socketService from '../services/socketService';

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, token } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      
      if (storedToken && !user) {
        try {
          const response = await fetch('/api/auth/me', {
            headers: {
              Authorization: `Bearer ${storedToken}`,
            },
          });
          
          if (response.ok) {
            const data = await response.json();
            dispatch(setUser(data.user));
            socketService.connect(storedToken);
          } else {
            localStorage.removeItem('token');
          }
        } catch (error) {
          localStorage.removeItem('token');
        }
      }
    };

    initializeAuth();
  }, [dispatch, user]);

  return { user, token };
};