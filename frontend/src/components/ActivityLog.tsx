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

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="flex flex-col">
            <div className="flex flex-col text-[#4E4E53]">
                <p className="text-2xl font-bold">Activity Logs</p>
            </div>
            <div className="flex flex-col text-[#4E4E53] mt-5">
                <div className="mt-6 overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-300">
                        <thead>
                            <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                                <th className="py-3 px-6 text-left">Date</th>
                                <th className="py-3 px-6 text-left">Action</th>
                                <th className="py-3 px-6 text-left">Details</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-600 text-sm font-light">
                            {activities.map((activity) => (
                                <tr key={activity.id} className="border-b border-gray-300 hover:bg-gray-100">
                                    <td className="py-3 px-6">
                                        {new Date(activity.created_at).toLocaleString()}
                                    </td>
                                    <td className="py-3 px-6">{formatType(activity.type)}</td>
                                    <td className="py-3 px-6">
                                        <div className="flex flex-col">
                                            {activity.data ? renderDetails(activity.data) : 'N/A'}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}