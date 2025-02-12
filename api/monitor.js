import axios from "axios";
import emailjs from "@emailjs/browser";

// Define the servers to monitor
const servers = [
  { id: "1", name: "Live Chat Agent", url: "https://bot.dgmatrix.com:8000/test" },
  { id: "2", name: "CLI Bot (9005)", url: "https://bot.dgmatrix.com:9005" },
  { id: "3", name: "Not Logged-in Bot (9007)", url: "https://bot.dgmatrix.com:9007" },
  { id: "4", name: "CLI Bot (9009)", url: "https://bot.dgmatrix.com:9009/images/241225bloomusermanual/issue.png" },
  { id: "5", name: "Installation Bot (9010)", url: "https://bot.dgmatrix.com:9010" },
];

// EmailJS Config
const serviceId = "service_fcfdk1p";
const templateId = "template_epeq4jb";
const publicKey = "BHIc8zvsSTfWHapYQ";
const toEmail = "minhaljaved10@gmail.com";

// Function to send an email
const sendEmailNotification = async (downServers) => {
  if (downServers.length === 0) return;

  const emailParams = {
    to_email: toEmail,
    subject: "⚠️ Server Down Alert",
    message:
      `The following servers are down:\n\n` +
      downServers
        .map(
          (server) =>
            `ID: ${server.id}\nName: ${server.name}\nStatus: DOWN\nLast Checked: ${new Date().toLocaleString()}\n\n`
        )
        .join(""),
  };

  try {
    await emailjs.send(serviceId, templateId, emailParams, publicKey);
    console.log("Email sent successfully!");
  } catch (error) {
    console.error("Failed to send email:", error);
  }
};

// Function to check server status
const checkServers = async () => {
  const downServers = [];

  for (const server of servers) {
    try {
      const response = await axios.get(server.url, { timeout: 5000 });
      if (response.status !== 200) {
        downServers.push({ ...server, status: "DOWN", lastChecked: new Date() });
      }
    } catch (error) {
      downServers.push({ ...server, status: "DOWN", lastChecked: new Date() });
    }
  }

  if (downServers.length > 0) {
    console.log("Some servers are down! Sending email...");
    await sendEmailNotification(downServers);
  } else {
    console.log("All servers are up.");
  }

  return downServers;
};

// Vercel Serverless Function
export default async function handler(req, res) {
  try {
    const downServers = await checkServers();
    res.status(200).json({ 
      message: "Server check completed", 
      downServers: downServers 
    });
  } catch (error) {
    console.error("Error in server monitoring:", error);
    res.status(500).json({ 
      message: "Error in server monitoring", 
      error: error.toString() 
    });
  }
}