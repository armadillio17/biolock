import { motion } from 'framer-motion';
import { RefreshCw, Clock, Users, FileText } from 'lucide-react';

const LoadingComponent = () => {
    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                when: 'beforeChildren',
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5 },
        },
    };

    const spinnerVariants = {
        animate: {
            rotate: 360,
            transition: {
                duration: 2,
                repeat: Infinity,
                ease: 'linear',
            },
        },
    };

    const pulseVariants = {
        animate: {
            scale: [1, 1.05, 1],
            transition: {
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
            },
        },
    };

    const floatingVariants = {
        animate: {
            y: [0, -10, 0],
            transition: {
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
            },
        },
    };

    const progressVariants = {
        animate: {
            width: ['0%', '100%'],
            transition: {
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
            },
        },
    };

    return (
            <motion.div
                className="flex items-center justify-center h-screen"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <div className="max-w-md text-center">
                    {/* Spinner with glow */}
                    <motion.div
                        className="relative mb-8"
                        variants={pulseVariants}
                        animate="animate"
                    >
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 blur-xl opacity-30 animate-pulse"></div>
                        <motion.div
                            className="relative p-6 bg-white border rounded-full shadow-2xl border-slate-200"
                            variants={floatingVariants}
                            animate="animate"
                        >
                            <motion.div variants={spinnerVariants} animate="animate">
                                <RefreshCw
                                    className="w-12 h-12 mx-auto"
                                    style={{
                                        background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                    }}
                                />
                            </motion.div>
                        </motion.div>
                    </motion.div>

                    {/* Text and subtext */}
                    <motion.div variants={itemVariants}>
                        <h2 className="mb-2 text-2xl font-bold text-transparent bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text">
                            Loading Attendance Records
                        </h2>
                        <motion.p
                            className="text-lg text-slate-500"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: [0, 1, 0.7, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            Please wait while we fetch your data...
                        </motion.p>
                    </motion.div>

                    {/* Progress bar */}
                    <motion.div className="w-full h-2 my-8 overflow-hidden rounded-full bg-slate-200">
                        <motion.div
                            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-600"
                            variants={progressVariants}
                            animate="animate"
                        />
                    </motion.div>

                    {/* Icons with floating pulse */}
                    <div className="flex justify-center space-x-8">
                        {[Clock, Users, FileText].map((Icon, index) => (
                            <motion.div
                                key={index}
                                className="flex flex-col items-center"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{
                                    opacity: [0.3, 1, 0.3],
                                    scale: [0.8, 1, 0.8],
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    delay: index * 0.2,
                                    ease: 'easeInOut',
                                }}
                            >
                                <div className="p-3 rounded-lg shadow-sm bg-gradient-to-br from-slate-100 to-slate-200">
                                    <Icon className="w-5 h-5 text-slate-600" />
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Loading dots */}
                    <div className="flex justify-center mt-8 space-x-2">
                        {[0, 1, 2].map((index) => (
                            <motion.div
                                key={index}
                                className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-purple-500"
                                animate={{
                                    scale: [1, 1.5, 1],
                                    opacity: [0.5, 1, 0.5],
                                }}
                                transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                    delay: index * 0.2,
                                    ease: 'easeInOut',
                                }}
                            />
                        ))}
                    </div>
                </div>
            </motion.div>
    );
};

export default LoadingComponent;
