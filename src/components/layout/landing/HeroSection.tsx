import { useRouter } from "next/navigation"
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Building2, TrendingUp, Shield } from "lucide-react";

export default function HeroSection() {
    const router = useRouter()
    return (
        <div className="relative h-[80vh] bg-background overflow-hidden">
            {/* Background Image */}
            <div className="absolute inset-0"> {/* Adjusted height */}
                <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent z-10" />
                <img
                    src="/samplehouse.svg"
                    alt="Background"
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Main Content */}
            <div className="container mx-auto relative z-20">
                <div className="flex flex-col max-w-[600px] pt-10 md:pt-20 px-4">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4"
                    >
                        Real Estate
                        <br />
                        on the Blockchain
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-lg text-black dark:text-white bg-white/10 rounded-2xl px-2 max-w-lg mb-8 backdrop-blur-sm"
                    >
                        Invest in properties starting from $100. <br />
                        Earn passive income with rental yields and property appreciation.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col sm:flex-row gap-4 mt-12 mb-12"
                    >
                        <Button 
                            size="lg" 
                            className="text-lg bg-primary hover:bg-primary/90 hover:border hover:border-white w-full sm:w-auto"
                            onClick={()=>router.push('/properties')}
                        >
                            Explore Properties
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </motion.div>

                    {/* Stats Section */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hidden md:grid grid-cols-3 gap-8"
                    >
                        <div className="flex flex-col">
                            <Building2 className="h-6 w-6 mb-2" />
                            <div className="font-bold text-xl">$10M+</div>
                            <div className="text-sm text-muted-foreground">Properties</div>
                        </div>
                        <div className="flex flex-col">
                            <TrendingUp className="h-6 w-6 mb-2" />
                            <div className="font-bold text-xl">12.5%</div>
                            <div className="text-sm text-muted-foreground">Avg. ROI</div>
                        </div>
                        <div className="flex flex-col">
                            <Shield className="h-6 w-6 mb-2" />
                            <div className="font-bold text-xl">SEC</div>
                            <div className="text-sm text-muted-foreground">Compliant</div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Desktop Phone Mockup with Slanted Cutoff */}
            <div className="hidden md:block relative mt-12">
                {/* Slanted Overlay */}
                <div 
                    className="absolute bottom-[400px] left-0 right-0 h-[250px] bg-background z-[11]"
                    style={{
                        transform: 'skewY(-6deg)',
                        transformOrigin: 'bottom left'
                    }}
                />
                
                {/* Phone Container */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="relative mx-auto px-4 -top-[600px] -right-[300px]"
                    style={{ 
                        width: '80%',
                        marginTop: '2rem'
                    }}
                >
                    <img
                        src="/lightphonemockup.svg"
                        alt="Phone frame"
                        className="hidden dark:block w-full h-auto relative z-10"
                        style={{
                            transform: 'translateY(10%)'
                        }}
                    />
                    <img
                        src="/darkphonemockup.svg"
                        alt="Phone frame"
                        className="block dark:hidden w-full h-auto relative z-10"
                        style={{
                            transform: 'translateY(10%)'
                        }}
                    />
                </motion.div>
            </div>

            {/* Mobile Phone Mockup with Slanted Cutoff*/}
            <div className="block md:hidden relative mt-24">
                {/* Slanted Overlay */}
                <div 
                    className="absolute -bottom-[60px] left-0 right-0 h-[150px] bg-background z-[11]"
                    style={{
                        transform: 'skewY(-6deg)',
                        transformOrigin: 'bottom left'
                    }}
                />
                
                {/* Phone Container */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="relative mx-auto px-4 w-full bottom-[120px]"
                >
                    <img
                        src="/lightmobilephone.svg"
                        alt="Phone frame"
                        className="hidden dark:block w-full h-auto relative z-10"
                        style={{
                            transform: 'translateY(10%)'
                        }}
                    />
                    <img
                        src="/darkmobilephone.svg"
                        alt="Phone frame"
                        className="block dark:hidden w-full h-auto relative z-10"
                        style={{
                            transform: 'translateY(10%)'
                        }}
                    />
                </motion.div>
            </div>
        </div>
    );
}