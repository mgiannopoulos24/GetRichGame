import React, { useState } from 'react';
import { ArrowRight, Github, ListChecks, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
// New Import
import { Room } from '@/pages/Room';

const rules = [
    'Rule 1: All players start with an equal amount of resources.',
    'Rule 2: Turns are taken in a clockwise direction.',
    'Rule 3: The goal is to collect 5 victory points before any other player.',
    'Rule 4: Trading is allowed only during your turn and must be a 1:1 resource exchange.',
];

// Use a constant for the API base URL.
// In a production setup, this will be handled by a reverse proxy or environment variable.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export const Landing: React.FC = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const logoColor = 'text-orange-400';
    const adventureColor = 'text-orange-300';

    const handlePlayNow = async () => {
        setIsLoading(true);
        console.log('Requesting new room ID from backend...');

        try {
            // Use the API_BASE_URL constant
            const response = await fetch(`${API_BASE_URL}/api/v1/rooms/create/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            const roomId = data.room_id;

            console.log(`Backend responded with Room ID: ${roomId}. Redirecting...`);
            navigate(`/room/${roomId}`);
        } catch (error) {
            console.error('Failed to create room:', error);
            alert(
                'Could not connect to the backend to create a room. Check network/backend status.',
            );
            setIsLoading(false);
        }
    };

    const pageAnimation = {
        initial: { opacity: 0, scale: 0.98 },
        animate: { opacity: 1, scale: 1 },
        transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    };

    return (
        <motion.div
            className="min-h-screen flex flex-col bg-gray-900 text-gray-100"
            initial={pageAnimation.initial}
            animate={pageAnimation.animate}
            transition={pageAnimation.transition}
        >
            <header className="p-4 bg-gray-800 top-0 z-10 shadow-md">
                <div className="max-w-6xl mx-auto px-4">
                    <h1 className={`text-2xl font-extrabold ${logoColor}`}>GetRich</h1>
                </div>
            </header>

            <main className="flex-grow">
                <section className="py-24 md:py-36 bg-gray-900">
                    <div className="max-w-2xl mx-auto text-center px-4">
                        <h2 className="text-6xl sm:text-7xl md:text-8xl font-extrabold tracking-tight text-gray-100 mb-6 leading-tight">
                            Start Your Epic <span className={adventureColor}>Adventure </span>
                            <br className="sm:hidden" />
                            Now
                        </h2>
                        <p className="text-lg md:text-xl text-gray-400 mb-12 max-w-xl mx-auto">
                            Join millions of players in the ultimate strategy game experience,
                            powered by a high-performance Python backend.
                        </p>

                        <div className="flex flex-col md:flex-row justify-center gap-3">
                            <Button
                                variant="default"
                                size="lg"
                                className="text-base"
                                onClick={handlePlayNow}
                                disabled={isLoading}
                            >
                                <ArrowRight className="mr-2 h-4 w-4" />
                                {isLoading ? 'Creating Room...' : 'Play Now'}
                            </Button>

                            <Button
                                variant="outline"
                                size="lg"
                                className="text-black"
                                onClick={() => console.log('Viewing All Available Rooms...')}
                            >
                                <Users className="mr-2 h-4 w-4" />
                                All Rooms
                            </Button>

                            <Button
                                variant="ghost"
                                size="lg"
                                className="text-base"
                                onClick={() => console.log('Creating a Private Room...')}
                            >
                                Private Room
                            </Button>
                        </div>
                    </div>
                </section>

                <section className="py-20 md:py-28 bg-gray-800 border-t border-b border-gray-700">
                    <div className="max-w-4xl mx-auto px-4">
                        <h3 className="text-3xl md:text-4xl font-bold text-center text-gray-100 mb-12 flex items-center justify-center">
                            <ListChecks className={`w-7 h-7 mr-3 ${adventureColor}`} />
                            How to Play & Rules
                        </h3>

                        <div className="grid md:grid-cols-2 gap-8">
                            {rules.map((rule, index) => (
                                <div
                                    key={index}
                                    className="bg-gray-700 p-6 rounded-xl shadow-md hover:shadow-lg transition duration-300"
                                >
                                    <p className={`font-bold text-lg mb-2 ${adventureColor}`}>
                                        Rule {index + 1}
                                    </p>
                                    <p className="text-gray-300">{rule}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            <footer className="mt-auto border-t border-gray-700 bg-gray-950 text-white p-6 md:p-10">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-center md:text-left">
                    <div className="mb-4 md:mb-0">
                        <p className="text-lg font-semibold">
                            &copy; {new Date().getFullYear()} GetRich
                        </p>
                    </div>

                    <div className="flex items-center space-x-6">
                        <a
                            href="https://github.com/mgiannopoulos24/GetRichGame"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-orange-400 transition duration-300 flex items-center"
                        >
                            <Github className="w-6 h-6 mr-2" />
                            GitHub Repository
                        </a>
                        <a
                            href="#"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-orange-400 transition duration-300"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="32"
                                height="32"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    fill="currentColor"
                                    d="M19.27 5.33C17.94 4.71 16.5 4.26 15 4a.1.1 0 0 0-.07.03c-.18.33-.39.76-.53 1.09a16.1 16.1 0 0 0-4.8 0c-.14-.34-.35-.76-.54-1.09c-.01-.02-.04-.03-.07-.03c-1.5.26-2.93.71-4.27 1.33c-.01 0-.02.01-.03.02c-2.72 4.07-3.47 8.03-3.1 11.95c0 .02.01.04.03.05c1.8 1.32 3.53 2.12 5.24 2.65c.03.01.06 0 .07-.02c.4-.55.76-1.13 1.07-1.74c.02-.04 0-.08-.04-.09c-.57-.22-1.11-.48-1.64-.78c-.04-.02-.04-.08-.01-.11c.11-.08.22-.17.33-.25c.02-.02.05-.02.07-.01c3.44 1.57 7.15 1.57 10.55 0c.02-.01.05-.01.07.01c.11.09.22.17.33.26c.04.03.04.09-.01.11c-.52.31-1.07.56-1.64.78c-.04.01-.05.06-.04.09c.32.61.68 1.19 1.07 1.74c.03.01.06.02.09.01c1.72-.53 3.45-1.33 5.25-2.65c.02-.01.03-.03.03-.05c.44-4.53-.73-8.46-3.1-11.95c-.01-.01-.02-.02-.04-.02M8.52 14.91c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.84 2.12-1.89 2.12m6.97 0c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.83 2.12-1.89 2.12"
                                />
                            </svg>
                        </a>
                    </div>
                </div>
            </footer>
        </motion.div>
    );
};
