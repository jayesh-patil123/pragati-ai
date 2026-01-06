import axios, { AxiosError } from "axios"

interface ApiErrorResponse {
  error?: string
  message?: string
}

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
})

apiClient.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
)

apiClient.interceptors.response.use(
  (response) => response.data,
  (error: AxiosError<ApiErrorResponse>) => {
    if (error.response) {
      const message =
        error.response.data?.error ||
        error.response.data?.message ||
        "Request failed"

      return Promise.reject(new Error(message))
    }

    if (error.request) {
      return Promise.reject(
        new Error("No response from server. Please try again.")
      )
    }

    return Promise.reject(new Error("Unexpected error occurred"))
  }
)

export default apiClient
