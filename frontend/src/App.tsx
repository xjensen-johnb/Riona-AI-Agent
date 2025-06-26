import { useState, useEffect } from 'react'
import GeneralActions from './components/GeneralActions'
import SendDirectMessage from './components/SendDirectMessage'
import ScrapeFollowers from './components/ScrapeFollowers'
import SendDmsFromFile from './components/SendDmsFromFile'
import Logs from './components/Logs'
import { FaRobot } from 'react-icons/fa'

function App() {
  const [logs, setLogs] = useState<string[]>([])
  const [dbConnected, setDbConnected] = useState(false)

  const log = (message: string) => {
    console.log(message)
    const timedMessage = `${new Date().toLocaleTimeString()}: ${message}`
    setLogs(prevLogs => [...prevLogs, timedMessage])
  }

  const checkDbStatus = async () => {
    try {
      const response = await fetch('/api/status')
      const data = await response.json()

      if (data.dbConnected) {
        setDbConnected(true)
        log('Database connection successful.')
      } else {
        setTimeout(checkDbStatus, 3000)
      }
    } catch (error) {
      log('Error checking database status. Retrying...')
      setTimeout(checkDbStatus, 3000)
    }
  }

  useEffect(() => {
    checkDbStatus()
  }, [])

  const apiCall = async (endpoint: string, body?: any) => {
    log(`apiCall triggered for endpoint: ${endpoint}`)
    try {
      const options: RequestInit = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }
      if (body) {
        options.body = JSON.stringify(body)
      }
      log(`Sending request to /api/${endpoint} with options: ${JSON.stringify(options)}`)

      const response = await fetch(`/api/${endpoint}`, options)
      log(`Received response status: ${response.status}`)
      const data = await response.json()
      if (response.ok) {
        log(`${endpoint} success: ${JSON.stringify(data)}`)
      } else {
        log(`${endpoint} error: ${JSON.stringify(data)}`)
      }
    } catch (error: any) {
      log(`${endpoint} fetch error: ${error.message}`)
      console.error(error)
    }
  }

  return (
    <>
      {!dbConnected && (
        <div id="spinner-overlay">
          <div className="spinner"></div>
          <p>Connecting to database...</p>
        </div>
      )}
      <div className="container">
        <h1><FaRobot /> Instagram Bot Control</h1>
        <GeneralActions apiCall={apiCall} />
        <SendDirectMessage apiCall={apiCall} />
        <ScrapeFollowers log={log} />
        <SendDmsFromFile apiCall={apiCall} />
        <Logs logs={logs} />
      </div>
    </>
  )
}

export default App
