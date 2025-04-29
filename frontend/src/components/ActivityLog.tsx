import { useState, useEffect } from "react";
import { base_url } from '../config';
import { authAxios } from "@/lib/secured-axios-instance";

export default function ActivityLog() {
    interface Activity {
        id: string;
        created_at: string;
        type: string;
        data?: string;
    }

    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Function to format type strings (e.g., "leave_request" -> "Leave Request")
    const formatType = (type: string): string => {
        return type
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    // Function to parse and display JSON data
    const renderDetails = (data: string | object) => {
        try {
            // First check if it's already an object (might happen if data is pre-parsed)
            const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
            
            if (typeof parsedData !== 'object' || parsedData === null) {
                return <div>{String(parsedData)}</div>;
            }
    
            // Handle arrays
            if (Array.isArray(parsedData)) {
                return (
                    <ul className="list-disc pl-5">
                        {parsedData.map((item, index) => (
                            <li key={index}>{renderDetails(item)}</li>
                        ))}
                    </ul>
                );
            }
    
            // Convert the object to an array of key-value pairs
            return Object.entries(parsedData).map(([key, value]) => {
                // Format the key (e.g., "leave_request_id" -> "Leave Request ID")
                const formattedKey = formatType(key);
                
                // Handle nested objects recursively
                if (typeof value === 'object' && value !== null) {
                    return (
                        <div key={key} className="mt-1">
                            <strong>{formattedKey}:</strong>
                            <div className="ml-4">
                                {renderDetails(value)}
                            </div>
                        </div>
                    );
                }
                
                // Special formatting for status
                if (key === 'status') {
                    const statusColor = value === 'pending' ? 'text-yellow-500' : 
                                      value === 'approved' ? 'text-green-500' : 
                                      'text-red-500';
                    return (
                        <div key={key} className={`mt-1 ${statusColor}`}>
                            <strong>{formattedKey}:</strong> {String(value).charAt(0).toUpperCase() + String(value).slice(1)}
                        </div>
                    );
                }
                
                return (
                    <div key={key} className="mt-1">
                        <strong>{formattedKey}:</strong> {String(value)}
                    </div>
                );
            });
        } catch (e) {
            console.error('Error rendering details:', e);
            return <div>{typeof data === 'string' ? data : 'N/A'}</div>;
        }
    };

    useEffect(() => {
        const fetchActivities = async () => {
            try {
                const response = await authAxios.get(`${base_url}/notifications/`);
                setActivities(response.data);
                setLoading(false);
            } catch (err) {
                setError(err instanceof Error ? err.message : "An unknown error occurred");
                setLoading(false);
            }
        };
        fetchActivities();
    }, []);
    
    console.log("activities", activities);
    
    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="flex flex-col">
            <div className="flex flex-col text-[#333]">
                <p className="text-2xl font-bold mb-2">Recent Logs</p>
            </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-gray-700">
                        <thead className="text-gray-600 uppercase text-xs">
                            <tr className="bg-black from-indigo-500 to-purple-600 text-white">
                                <th className="py-3 px-6 text-left rounded-tl-2xl">Date</th>
                                <th className="py-3 px-6 text-left">Action</th>
                                <th className="py-3 px-6 text-left rounded-tr-2xl">Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            {activities.map((activity) => (
                                <tr key={activity.id} className="bg-white ">
                                    <td className="py-4 px-6 whitespace-nowrap">{new Date(activity.created_at).toLocaleString()}</td>
                                    <td className="py-4 px-6 whitespace-nowrap font-medium">{formatType(activity.type)}</td>
                                    <td className="py-4 px-6">
                                        <div className="flex flex-col gap-1">
                                            {activity.data ? (
                                                <>
                                                    <p><span className="font-semibold">Leave Request Id:</span> {activity.data.leave_request_id}</p>
                                                    <p className="flex items-center gap-2">
                                                        <span className="font-semibold">Status:</span>
                                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                            activity.data.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                                                            activity.data.status === 'Approved' ? 'bg-green-100 text-green-700' :
                                                            'bg-red-100 text-red-700'
                                                        }`}>
                                                            {activity.data.status}
                                                        </span>
                                                    </p>
                                                    <p><span className="font-semibold">Details:</span> {activity.data.details}</p>
                                                </>
                                            ) : 'N/A'}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
        </div>


    );
}