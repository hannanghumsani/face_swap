import apiInstance from "../Network/apiInterceptor";

export const getAllUsers = async (perPage = 10, page = 1) => {
  try {
    return await apiInstance.get(`/user`, { params: { perPage, page } });
  } catch (err) {
    console.error("Error fetching users:", err.response || err.message);
    throw err;
  }
};

export const getAllUsersSSR = async (perPage = 10, page = 1, token) => {
  try {
    return await axios.get(`${API_URL}/user`, {
      params: { perPage, page },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (err) {
    console.error("Error fetching users:", err.response || err.message);
    throw err.response;
  }
};

// createUser.ts
export const createUser = async (userData) => {
  try {
    return await apiInstance.post(`/user/addUser`, userData);
  } catch (err) {
    console.error("Error creating user:", err.response || err.message);
    throw err;
  }
};

export const createUsers = async (usersArray) => {
  try {
    return await apiInstance.post(`/user/bulk`, usersArray);
  } catch (err) {
    console.error(
      "Error creating multiple users:",
      err.response || err.message
    );
    throw err;
  }
};

export const updateUser = async (userId, updatedData) => {
  try {
    return await apiInstance.put(`/user/${userId}`, updatedData);
  } catch (err) {
    console.error("Error updating user:", err.response || err.message);
    throw err;
  }
};

export const deleteUser = async (userId) => {
  try {
    return await apiInstance.delete(`/user?userId=${userId}`);
  } catch (err) {
    console.error("Error deleting user:", err.response || err.message);
    throw err;
  }
};

export const getUserById = async (userId) => {
  try {
    return await apiInstance.get(`/user/userById/${userId}`);
  } catch (err) {
    throw err;
  }
};

// Login & Register - Direct API Calls (No Interceptor)
import axios from "axios";
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const registerUser = async (userData) => {
  try {
    return await axios.post(`${API_URL}/user/register`, userData);
  } catch (err) {
    throw err.response;
  }
};

export const loginUser = async (userData) => {
  try {
    return await axios.post(`${API_URL}/user/login`, userData);
  } catch (err) {
    throw err.response;
  }
};
