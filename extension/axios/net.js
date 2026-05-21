import axios from "axios"

// Custom adapter that proxies requests to background
const backgroundAdapter = (config) =>
    new Promise(async (resolve, reject) => {
        // 🧠 Convert FormData → plain object
        if (config.data instanceof FormData) {
            const formDataObj = {}
            for (const [key, value] of config.data.entries()) {
                // If value is File or Blob, convert to base64 (optional)
                if (value instanceof File || value instanceof Blob) {
                    const base64 = await new Promise((res) => {
                        const reader = new FileReader()
                        reader.onload = () => res(reader.result)
                        reader.readAsDataURL(value)
                    })
                    formDataObj[key] = base64
                } else {
                    formDataObj[key] = value
                }
            }
            config.data = formDataObj
            // Optional: also set content type
            config.headers["Content-Type"] = "application/json"
        }
        browser.runtime.sendMessage(
            {
                type: "axios-proxy",
                url: config.baseURL ? config.baseURL + config.url : config.url,
                config: {
                    method: config.method,
                    headers: config.headers,
                    data: config.data,
                },
            },
            (response) => {
                if (!response) {
                    return reject(new Error("No response from background"))
                }
                if (response.error) {
                    return reject({
                        isAxiosError: true,
                        config,
                        response: response.response,
                    })

                }

                resolve({
                    data: response.data,
                    status: response.status,
                    statusText: response.statusText,
                    headers: response.headers,
                    config,
                    request: null,
                })
            }
        )
    })

// Axios instance with baseURL + adapter
const axiosInstance = axios.create({
    baseURL: "",
    adapter: backgroundAdapter
})

export default axiosInstance
