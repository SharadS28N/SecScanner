import { type NextRequest, NextResponse } from "next/server"
import { exec } from "child_process"
import { promisify } from "util"
import path from "path"

const execAsync = promisify(exec)

export async function POST(request: NextRequest) {
  try {
    const scriptPath = path.join(process.cwd(), "scripts", "wifi_scanner_api.py")
    const pythonPath = path.join(process.cwd(), "venv", "Scripts", "python.exe")

    // Execute the Python script from the virtual environment
    const { stdout, stderr } = await execAsync(`"${pythonPath}" "${scriptPath}"`)

    if (stderr) {
      console.error("Python script stderr:", stderr)
    }

    // Parse and return real scan results
    const data = JSON.parse(stdout)
    return NextResponse.json(data)
  } catch (error) {
    console.error("WiFi scan error:", error)
    return NextResponse.json({ error: "Failed to scan WiFi networks." }, { status: 500 })
  }
}
