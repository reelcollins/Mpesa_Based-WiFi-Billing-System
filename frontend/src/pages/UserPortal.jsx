import React, { useState, useEffect } from "react";
import axios from "axios";
import { CheckCircle, Clock, AlertTriangle, WifiIcon, CreditCard } from "lucide-react";
import { API_URL } from "../config/config";
import Skeleton from "../components/ui/Skeleton";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const UserPortal = () => {
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState(30);
  const [transactionId, setTransactionId] = useState(null);
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [macAddress, setMacAddress] = useState("UNKNOWN_MAC");
  const [paymentMethod, setPaymentMethod] = useState("mpesa"); // "mpesa" or "equity"

  const packages = [
    { label: "24 Hours", value: 30, price: "Ksh 30", duration: "Full Day", speed: "5 Mbps", color: "from-purple-500 to-indigo-600" },
    { label: "12 Hours", value: 20, price: "Ksh 20", duration: "Half Day", speed: "4 Mbps", color: "from-blue-500 to-cyan-600" },
    { label: "4 Hours", value: 15, price: "Ksh 15", duration: "Short Session", speed: "3 Mbps", color: "from-green-500 to-emerald-600" },
    { label: "1 Hour", value: 1, price: "Ksh 1", duration: "Quick Access", speed: "2 Mbps", color: "from-yellow-500 to-orange-600" },
  ];

  useEffect(() => {
    fetchMacAddress();
  }, []);

  const fetchMacAddress = async () => {
    try {
      const res = await axios.get("https://api64.ipify.org?format=json");
      const ip = res.data.ip;

      const macRes = await axios.get(`${API_URL}/api/get-mac?ip=${ip}`);
      setMacAddress(macRes.data.mac || "UNKNOWN_MAC");
    } catch (error) {
      console.error("Error fetching MAC address:", error);
    }
  };

  const handlePayment = async () => {
    if (!phone || phone.length < 10) {
      toast.error("Please enter a valid phone number.");
      return;
    }

    setIsLoading(true);

    // Format phone number for both payment methods
    const formatPhoneNumber = (phone) => {
      if (phone.startsWith("07")) {
        return phone.replace(/^07/, "2547");
      } else if (phone.startsWith("01")) {
        return phone.replace(/^01/, "2541");
      }
      return phone; // Keep as is if already in the correct format
    };

    try {
      // Choose the endpoint based on payment method
      const endpoint = paymentMethod === "mpesa" 
        ? `${API_URL}/api/mpesa/pay`
        : `${API_URL}/api/jenga/pay`;
      
      const response = await axios.post(endpoint, { 
        phone: formatPhoneNumber(phone), 
        amount, 
        mac_address: macAddress 
      });

      if (response.data.success) {
        setTransactionId(response.data.transactionId);
        
        if (paymentMethod === "mpesa") {
          toast.success("Payment request sent! Check your phone.");
        } else {
          // For Equity/Jenga, we might handle differently
          if (response.data.paymentLink) {
            toast.success("Payment link generated! Redirecting to Equity payment page...");
            // Optionally redirect to the payment link
            window.open(response.data.paymentLink, "_blank");
          } else {
            toast.success("Payment request sent! Check your phone for Equity Bank confirmation.");
          }
        }
        
        setStatus("pending");
      } else {
        toast.error(`${paymentMethod.toUpperCase()} payment request failed. Try again.`);
      }
    } catch (error) {
      toast.error("Something went wrong. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-br from-blue-800 to-black p-4">
      <div className="text-center text-white mb-6">
        <h1 className="text-3xl font-bold">Kibeezy WiFi</h1>
        <p className="text-lg text-gray-200">Affordable and Reliable</p>
      </div>

      <div className="relative w-full max-w-md overflow-hidden rounded-2xl shadow-2xl backdrop-blur-md bg-white/10 border border-white/20">
        <div className="bg-gradient-to-r from-blue-600 to-violet-600 p-6 text-white flex flex-col items-center">
          <div className="bg-white/20 p-3 rounded-full mb-2">
            <WifiIcon className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold">Kibeezy</h2>
          <p className="text-center text-blue-100 mt-1">Connect instantly to high-speed internet</p>
        </div>

        <div className="p-6 space-y-5">
          <div className="space-y-2">
            <label className="block text-white mb-1">Mobile Number</label>
            <input
              type="tel"
              placeholder="Enter mobile number (07/01XXXXXXXX)"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-white mb-1">Select Package</label>
            <div className="grid grid-cols-2 gap-4">
              {packages.map((pkg) => (
                <div 
                  key={pkg.value} 
                  className={`rounded-2xl p-4 cursor-pointer transition-all duration-300 border-2 shadow-xl bg-gradient-to-r ${pkg.color} hover:scale-105 ${amount === pkg.value ? 'border-white scale-110' : 'border-transparent'}`}
                  onClick={() => setAmount(pkg.value)}
                >
                  <div className="flex flex-col items-center p-3 rounded-lg bg-white/10">
                    <div className="font-bold text-white text-lg">{pkg.label}</div>
                    <div className="text-sm text-white/80">{pkg.price}</div>
                    <div className="text-xs mt-1 text-white/70">{pkg.speed}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-white mb-1">Payment Method</label>
            <div className="grid grid-cols-2 gap-4">
              <div 
                className={`rounded-xl p-3 cursor-pointer transition-all duration-300 border-2 ${paymentMethod === 'mpesa' ? 'border-green-400 bg-green-900/20' : 'border-white/20 bg-white/5'}`}
                onClick={() => setPaymentMethod('mpesa')}
              >
                <div className="flex items-center justify-center">
                  <div className="mr-2 text-green-400">M</div>
                  <div className="font-bold text-white">M-Pesa</div>
                </div>
              </div>
              
              <div 
                className={`rounded-xl p-3 cursor-pointer transition-all duration-300 border-2 ${paymentMethod === 'equity' ? 'border-blue-400 bg-blue-900/20' : 'border-white/20 bg-white/5'}`}
                onClick={() => setPaymentMethod('equity')}
              >
                <div className="flex items-center justify-center">
                  <CreditCard className="h-5 w-5 mr-2 text-blue-400" />
                  <div className="font-bold text-white">Equity Bank</div>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handlePayment}
            className={`w-full py-3 rounded-xl text-white font-medium transition duration-300 ${
              isLoading 
                ? "bg-gradient-to-r from-gray-500 to-gray-600 cursor-not-allowed" 
                : paymentMethod === 'mpesa'
                  ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:shadow-lg hover:shadow-green-500/40 active:scale-95"
                  : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:shadow-lg hover:shadow-blue-500/40 active:scale-95"
            }`}
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : 
              paymentMethod === 'mpesa' ? "Pay via M-Pesa" : "Pay via Equity Bank"}
          </button>

          {status && (
            <div className={`flex items-center justify-center p-3 rounded-lg ${
              status === "confirmed" ? "bg-green-100 text-green-800" 
              : status === "pending" ? "bg-yellow-100 text-yellow-800" 
              : "bg-red-100 text-red-800"
            }`}>
              {status === "confirmed" && <CheckCircle className="text-green-500 mr-2" />}
              {status === "pending" && <Clock className="text-yellow-500 mr-2" />}
              {status === "failed" && <AlertTriangle className="text-red-500 mr-2" />}
              <span className="font-medium capitalize">Payment Status: {status}</span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6">
        <Link to="/admin" className="text-white underline">Go to Admin Dashboard</Link>
      </div>
    </div>
  );
};

export default UserPortal;
