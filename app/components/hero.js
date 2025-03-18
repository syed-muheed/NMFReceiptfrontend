'use client';
import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Image from 'next/image';
import src from "@/public/images/NMF.png"

export default function Hero() {
  const [volunteerName, setVolunteerName] = useState('');
  const [donorName, setDonorName] = useState('');
  const [donorPAN, setDonorPAN] = useState('');
  const [denominations, setDenominations] = useState({
    1: 0, 2: 0, 5: 0, 10: 0, 20: 0, 50: 0,
    100: 0, 200: 0, 500: 0,
  });
  const [total, setTotal] = useState(0);
  const [email, setEmail] = useState('');
  const [mobileNo, setMobileNo] = useState('');
  const [Address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);

  const calculateTotal = () => {
    const sum = Object.entries(denominations).reduce((acc, [denomination, count]) => acc + denomination * count, 0);
    setTotal(sum);
  };

  const increment = (denom) => {
    setDenominations({ ...denominations, [denom]: denominations[denom] + 1 });
  };

  const decrement = (denom) => {
    setDenominations({ ...denominations, [denom]: Math.max(0, denominations[denom] - 1) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.post(`http://localhost:5001/api/receipt`, {
        volunteerName,
        donorName,
        donorPAN,
        denominations,
        total,
        email,
        mobileNo,
        Address
      });
  
      if (response.data.pdfUrl) {
        setPdfUrl(response.data.pdfUrl);
        toast.success('Receipt Generated! Click Download.');
      } else {
        toast.error('Error generating receipt.');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to generate receipt.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setVolunteerName('');
    setDonorName('');
    setDonorPAN('');
    setEmail('');
    setMobileNo('');
    setAddress('');
    setDenominations({
      1: 0, 2: 0, 5: 0, 10: 0, 20: 0, 50: 0, 100: 0, 200: 0, 500: 0,
    });
    setTotal(0);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <Image height={120} className='mx-auto' alt='image' src={src}/>
        <h2 className="text-2xl font-bold mb-6 text-center">Sadaqah-e-Jaariya Box Receipt</h2>

        <InputField label="Volunteer Name" value={volunteerName} onChange={setVolunteerName} />
        <InputField label="Donor Name" value={donorName} onChange={setDonorName} />
        {/* <InputField label="Donor PAN" value={donorPAN} onChange={setDonorPAN} />
        <InputField label="Email" value={email} onChange={setEmail} type="" /> */}
        <InputField label="Mobile Number" value={mobileNo} onChange={setMobileNo} type="tel" pattern="[0-9]{10}" />
        {/* <InputField label="Address" value={Address} onChange={setAddress} /> */}

        <h3 className="text-lg font-semibold mb-4">Denominations</h3>
        <div className="grid grid-cols-2 gap-4">
          {Object.keys(denominations).map((denom) => (
            <div key={denom} className="items-center space-x-2">
              <label className="block text-sm font-bold mb-1 w-16">{denom} Rs</label>
              <div className='border border-gray-300 rounded flex p-1'>
                <input
                  type="number"
                  min="0"
                  value={denominations[denom] === 0 ? '' : denominations[denom]}
                  onChange={(e) => setDenominations({
                    ...denominations,
                    [denom]: e.target.value === '' ? 0 : parseInt(e.target.value),
                  })}
                  className="w-full p-2 rounded font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className='flex gap-2'>
                  <button
                    type="button"
                    onClick={() => decrement(denom)}
                    className="border border-gray-400 text-black px-[15px] py-1 rounded"
                  >
                    -
                  </button>
                  <button
                    type="button"
                    onClick={() => increment(denom)}
                    className="border border-gray-400 text-black px-3.5 py-1 rounded"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <button
            type="button"
            onClick={calculateTotal}
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition"
          >
            Calculate Total
          </button>
        </div>

        <div className="mt-4 text-center text-lg font-semibold">
          Total Amount: ₹{total}
        </div>

        <div className="mt-6">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600 transition"
          >
            {isLoading ? 'Generating...' : 'Generate and Send Receipt'}
          </button>
        </div>
        {pdfUrl && (
  <div className="mt-4 text-center">
    <button
      onClick={() => {
        // Open in a new tab for viewing
        window.open(pdfUrl, '_blank');

        // Trigger download
        const link = document.createElement('a');
        link.href = `http://localhost:5001/api/download/${pdfUrl.split('/').pop()}`;
        link.download = pdfUrl.split('/').pop(); // Ensure file has the correct name
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }}
      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
    >
      View & Download PDF
    </button>
  </div>
)}
      </form>
      
    </div>
  );
}

const InputField = ({ label, value, onChange, type = 'text' }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium mb-2">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required
      
      className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>
);
