import { useState, useEffect } from "react";
import { base_url } from '../config';
import { authAxios } from "@/lib/secured-axios-instance";

interface ActivityData {
    leave_request_id?: string;
    status?: string;
    details?: string;
    [key: string]: string | number | boolean | object | null | undefined;
}

interface Activity {
    id: string;
    created_at: string;
    type: string;
    data?: ActivityData | string;
}

export default function ActivityLog() {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const formatType = (type: string): string => {
        return type
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    // const renderDetails = (data: string | object) => {
    //     try {
    //         const parsedData = typeof data === 'string' ? JSON.parse(data) : data;

    //         if (typeof parsedData !== 'object' || parsedData === null) {
    //             return <div>{String(parsedData)}</div>;
    //         }

    //         if (Array.isArray(parsedData)) {
    //             return (
    //                 <ul className="pl-5 list-disc">
    //                     {parsedData.map((item, index) => (
    //                         <li key={index}>{renderDetails(item)}</li>
    //                     ))}
    //                 </ul>
    //             );
    //         }

    //         return Object.entries(parsedData).map(([key, value]) => {
    //             const formattedKey = formatType(key);

    //             if (typeof value === 'object' && value !== null) {
    //                 return (
    //                     <div key={key} className="mt-1">
    //                         <strong>{formattedKey}:</strong>
    //                         <div className="ml-4">
    //                             {renderDetails(value)}
    //                         </div>
    //                     </div>
    //                 );
    //             }

    //             if (key === 'status') {
    //                 const statusColor = value === 'pending' ? 'text-yellow-500' :
    //                     value === 'approved' ? 'text-green-500' :
    //                         'text-red-500';
    //                 return (
    //                     <div key={key} className={`mt-1 ${statusColor}`}>
    //                         <strong>{formattedKey}:</strong> {String(value).charAt(0).toUpperCase() + String(value).slice(1)}
    //                     </div>
    //                 );
    //             }

    //             return (
    //                 <div key={key} className="mt-1">
    //                     <strong>{formattedKey}:</strong> {String(value)}
    //                 </div>
    //             );
    //         });
    //     } catch (e) {
    //         console.error('Error rendering details:', e);
    //         return <div>{typeof data === 'string' ? data : 'N/A'}</div>;
    //     }
    // };

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
            <div className="flex flex-col text-[#333]">
                <p className="mb-2 text-2xl font-bold">Recent Logs</p>
            </div>

            <div className="w-full px-2 overflow-x-auto sm:px-4">
                <table className="min-w-[600px] sm:min-w-full text-sm text-gray-700">
                    <thead className="text-xs text-gray-600 uppercase">
                        <tr className="text-white bg-black from-indigo-500 to-purple-600">
                            <th className="px-6 py-3 text-left rounded-tl-2xl">Date</th>
                            <th className="px-6 py-3 text-left">Action</th>
                            <th className="px-6 py-3 text-left rounded-tr-2xl">Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {activities.map((activity) => {
                            let parsedData: ActivityData = {};

                            if (typeof activity.data === 'string') {
                                try {
                                    parsedData = JSON.parse(activity.data);
                                } catch (e) {
                                    console.error('Failed to parse activity.data:', e);
                                }
                            } else if (typeof activity.data === 'object' && activity.data !== null) {
                                parsedData = activity.data;
                            }

                            return (
                                <tr key={activity.id} className="bg-white">
                                    <td className="px-6 py-4 whitespace-nowrap">{new Date(activity.created_at).toLocaleString()}</td>
                                    <td className="max-w-xs px-6 py-4 break-words whitespace-normal">{formatType(activity.type)}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            {parsedData?.leave_request_id || parsedData?.status || parsedData?.details ? (
                                                <>
                                                    {parsedData.leave_request_id && (
                                                        <p>
                                                            <span className="font-semibold">Leave Request Id:</span> {parsedData.leave_request_id}
                                                        </p>
                                                    )}
                                                    {parsedData.status && (
                                                        <p className="flex items-center gap-2">
                                                            <span className="font-semibold">Status:</span>
                                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${parsedData.status.toLowerCase() === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                                    parsedData.status.toLowerCase() === 'approved' ? 'bg-green-100 text-green-700' :
                                                                        'bg-red-100 text-red-700'
                                                                }`}>
                                                                {parsedData.status}
                                                            </span>
                                                        </p>
                                                    )}
                                                    {parsedData.details && (
                                                        <p>
                                                            <span className="font-semibold">Details:</span> {parsedData.details}
                                                        </p>
                                                    )}
                                                </>
                                            ) : 'N/A'}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}