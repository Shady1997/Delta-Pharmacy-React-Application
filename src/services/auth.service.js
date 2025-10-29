import ApiService from './api.service';

class AuthService {
  async login(email, password) {
    try {
      const userData = await ApiService.post('/auth/login', { email, password });
      
      console.log('Login userData:', userData);
      
      if (userData.token) {
        localStorage.setItem('token', userData.token);
        const { token, type, ...userInfo } = userData;
        localStorage.setItem('user', JSON.stringify(userInfo));
        
        return {
          token: userData.token,
          user: userInfo
        };
      }
      
      throw new Error('No token in response');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async register(fullName, email, password, phoneNumber, address) {
    try {
      const userData = await ApiService.post('/auth/register', {
        fullName,
        email,
        password,
        phoneNumber,
        address
      });
      
      if (userData.token) {
        localStorage.setItem('token', userData.token);
        const { token, type, ...userInfo } = userData;
        localStorage.setItem('user', JSON.stringify(userInfo));
        
        return {
          token: userData.token,
          user: userInfo
        };
      }
      
      throw new Error('No token in response');
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    if (!userStr || userStr === 'undefined') {
      return null;
    }
    try {
      return JSON.parse(userStr);
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }

  getToken() {
    const token = localStorage.getItem('token');
    return token && token !== 'undefined' ? token : null;
  }

  isAuthenticated() {
    return !!this.getToken();
  }
}

const authServiceInstance = new AuthService();
export default authServiceInstance;