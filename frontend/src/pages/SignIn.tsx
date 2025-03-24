import { useState } from 'react';
import '@/assets/css/SignIn.css';
import { motion } from 'framer-motion';
import Logo from '@/assets/logo.webp';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { User, Lock1 } from 'iconsax-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore'; // Update path as needed

function SignIn() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });

    // Get authentication state and actions from the auth store
    const { login, loginError, isLoading } = useAuthStore();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const success = await login(formData.username, formData.password);

        if (success) {
            navigate("/dashboard");
        } else if (loginError) {
            alert(loginError);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Framer Motion animation configuration
    const containerVariants = {
        hidden: { opacity: 0, x: - 100 },
        visible: { opacity: 1, x: 0, transition: { duration: 1.5 } },
    };

    return (
        <div className="flex items-center justify-center w-full min-h-screen SignIn">
            {/* Animated container */}
            <motion.div
                className="md:min-w-[540px] min-h-[540px] bg-[#CCE5FE] rounded-xl shadow-md p-8 flex flex-col items-center gap-8"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
            >
                <img src={Logo} alt="Logo" className="max-h-[62px] max-w-[61px]" />
                <div>
                    <h1 className="mb-2 text-2xl font-bold">Lorem Ipsum dolor Emet</h1>
                    <p className="mb-4 text-sm">Lorem ipsum dolor sit amet,</p>
                    <form onSubmit={handleSubmit} className="min-w-[300px] flex flex-col gap-4">
                        <div className="relative w-full">
                            <User
                                size="18"
                                color="#7582FA"
                                className="absolute transform -translate-y-1/2 left-3 top-1/2"
                            />
                            <Input
                                className="pl-9 h-[51px] bg-white rounded-[5px] placeholder:text-md placeholder:text-[#4E4E53] border-[#000000]"
                                id="username"
                                name="username"
                                placeholder="Username"
                                value={formData.username}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <div className="relative w-full">
                                <Lock1
                                    size="18"
                                    color="#FABA6C"
                                    className="absolute transform -translate-y-1/2 left-3 top-1/2"
                                />
                                <Input
                                    type="password"
                                    className="pl-9 h-[51px] bg-white rounded-[5px] placeholder:text-md placeholder:text-[#4E4E53] border-[#000000]"
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Password"
                                    required
                                />
                            </div>
                        </div>
                        <div className="flex justify-between text-sm">
                            <div className="flex items-center gap-2">
                                <Checkbox className="rounded-[4px]" />
                                <p>Remember Me</p>
                            </div>
                            <div>
                                <p>Forgot password?</p>
                            </div>
                        </div>
                        <Button
                            type="submit"
                            className="w-full bg-[#7BDFF2] min-h-[51px] rounded-[5px]"
                            disabled={isLoading}
                        >
                            <p className="text-md font-bold text-[#4E4E53]">
                                {isLoading ? "Signing In..." : "Sign In"}
                            </p>
                        </Button>
                        <div className="flex justify-center mt-8">
                            <p>Don't have an account?</p>
                            <a href="/sign-up" className="text-[#1600DD]">
                                Create an account
                            </a>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}

export default SignIn;