"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation, Filter, Star, Clock, Locate } from "lucide-react";
import { toast } from "sonner";

interface FoodPin {
    id: number;
    name: string;
    foodType: string;
    lat: number;
    lng: number;
    rating: number;
    addedBy: string;
    emoji: string;
}

const SAMPLE_PINS: FoodPin[] = [
    { id: 1, name: "Raghu's Vada Pav", foodType: "Street Food", lat: 19.0760, lng: 72.8777, rating: 4.8, addedBy: "foodie_raj", emoji: "🥪" },
    { id: 2, name: "Sharma Ji's Chaat", foodType: "Chaat", lat: 28.6139, lng: 77.2090, rating: 4.9, addedBy: "delhi_eats", emoji: "🥟" },
    { id: 3, name: "Lakshmi's Dosa Corner", foodType: "South Indian", lat: 12.9716, lng: 77.5946, rating: 4.7, addedBy: "dosa_king", emoji: "🥞" },
    { id: 4, name: "Khan's Kebab House", foodType: "Kebab", lat: 26.8467, lng: 80.9462, rating: 4.6, addedBy: "kebab_lover", emoji: "🍖" },
    { id: 5, name: "Mohan's Misal", foodType: "Maharashtrian", lat: 18.5204, lng: 73.8567, rating: 4.8, addedBy: "pune_foodie", emoji: "🍲" }
];

const FOOD_TYPES = ["All", "Street Food", "Chaat", "South Indian", "Kebab", "Maharashtrian"];

export function CommunityMap() {
    const [pins, setPins] = useState<FoodPin[]>(SAMPLE_PINS);
    const [selectedFilter, setSelectedFilter] = useState("All");
    const [selectedPin, setSelectedPin] = useState<FoodPin | null>(null);

    const filteredPins = selectedFilter === "All"
        ? pins
        : pins.filter(pin => pin.foodType === selectedFilter);

    const handlePinClick = (pin: FoodPin) => {
        setSelectedPin(pin == selectedPin ? null : pin);
    };

    const handleAddPin = () => {
        toast.info("Add location feature coming soon! 📍", {
            description: "Help the community discover hidden gems!"
        });
    };

    return (
        <Card className="hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white overflow-hidden group rounded-[2rem]">
            <CardHeader className="bg-blue-400 border-b-4 border-black py-5 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                <div className="flex justify-between items-start relative z-10">
                    <div>
                        <CardTitle className="flex items-center gap-3 text-xl text-white drop-shadow-md">
                            <div className="p-2 bg-white rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                <MapPin className="w-5 h-5 text-blue-600" />
                            </div>
                            <span className="font-black uppercase tracking-wide">Food Map</span>
                        </CardTitle>
                        <p className="text-xs text-white font-bold mt-1 ml-1 uppercase tracking-widest opacity-90">
                            Find hidden gems
                        </p>
                    </div>
                    <Button size="sm" onClick={handleAddPin} className="bg-white text-black font-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-gray-100">
                        <MapPin className="w-4 h-4 mr-2" />
                        Add Pin
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="pt-6 space-y-5 px-5">
                {/* Filter Chips */}
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {FOOD_TYPES.map(type => (
                        <button
                            key={type}
                            onClick={() => setSelectedFilter(type)}
                            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all duration-300 border-2 border-black ${selectedFilter === type
                                ? "bg-blue-500 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transform -translate-y-0.5"
                                : "bg-white text-black hover:bg-gray-100 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                                }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>

                {/* Map Placeholder */}
                <div className="relative w-full h-64 bg-[#bfdbfe] rounded-2xl overflow-hidden border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-shadow">
                    {/* Abstract Map Pattern */}
                    <div className="absolute inset-0 opacity-40" style={{
                        backgroundImage: 'radial-gradient(#1e3a8a 1.5px, transparent 1.5px), radial-gradient(#1e3a8a 1.5px, transparent 1.5px)',
                        backgroundSize: '20px 20px',
                        backgroundPosition: '0 0, 10px 10px'
                    }}></div>

                    {/* Animated Radar Effect */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-blue-500 rounded-full animate-ping opacity-20" style={{ animationDuration: '3s' }}></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-blue-600 rounded-full animate-pulse border-4 border-white shadow-xl"></div>

                    {/* Center Marker */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                        <div className="relative">
                            <div className="w-4 h-4 bg-white rounded-full border-2 border-black"></div>
                        </div>
                    </div>

                    {/* Floating Pins */}
                    <div className="absolute top-1/4 left-1/4 animate-bounce" style={{ animationDuration: '2s' }}>
                        <div className="bg-white p-2 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black transform -rotate-6 hover:rotate-0 transition-transform cursor-pointer hover:scale-110">
                            <span className="text-2xl">🥪</span>
                        </div>
                    </div>
                    <div className="absolute bottom-1/3 right-1/4 animate-bounce" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}>
                        <div className="bg-white p-2 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black transform rotate-6 hover:rotate-0 transition-transform cursor-pointer hover:scale-110">
                            <span className="text-2xl">🥟</span>
                        </div>
                    </div>
                    <div className="absolute top-1/3 right-1/3 animate-bounce" style={{ animationDuration: '2.2s', animationDelay: '1s' }}>
                        <div className="bg-white p-2 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black transform -rotate-3 hover:rotate-0 transition-transform cursor-pointer hover:scale-110">
                            <span className="text-2xl">🥞</span>
                        </div>
                    </div>

                    {/* Overlay Text */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white px-4 py-2 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black flex items-center gap-2 whitespace-nowrap">
                        <Navigation className="w-4 h-4 text-blue-600 animate-spin-slow" />
                        <span className="text-xs font-black text-black uppercase tracking-wide">Interactive Map Coming Soon</span>
                    </div>
                </div>

                {/* Pins List */}
                <div className="space-y-3">
                    <h4 className="text-xs font-black text-black uppercase tracking-wider flex items-center gap-2 px-1">
                        <Locate className="w-4 h-4" />
                        Nearby Hotspots
                    </h4>
                    <div className="space-y-3 max-h-64 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-black scrollbar-track-gray-100">
                        {filteredPins.map(pin => (
                            <button
                                key={pin.id}
                                onClick={() => handlePinClick(pin)}
                                className={`w-full text-left p-3 rounded-xl border-2 transition-all duration-200 group/item ${selectedPin?.id === pin.id
                                    ? "border-black bg-blue-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transform -translate-y-0.5"
                                    : "border-black hover:bg-gray-50 bg-white"
                                    }`}
                            >
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-2xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] group-hover/item:scale-110 transition-transform">
                                        {pin.emoji}
                                    </div>
                                    <div className="flex-1 min-w-0 pt-0.5">
                                        <h5 className="font-black text-sm text-black truncate uppercase">{pin.name}</h5>
                                        <p className="text-xs text-gray-600 font-bold mb-1">{pin.foodType}</p>
                                        <div className="flex items-center gap-3">
                                            <span className="flex items-center gap-1 text-[10px] font-black bg-yellow-300 text-black px-1.5 py-0.5 rounded border border-black shadow-sm">
                                                <Star className="w-2.5 h-2.5 fill-black" />
                                                {pin.rating}
                                            </span>
                                            <span className="text-[10px] text-gray-400 font-bold truncate">by @{pin.addedBy}</span>
                                        </div>
                                    </div>
                                    <div className={`p-2 rounded-full border-2 border-black transition-colors ${selectedPin?.id === pin.id ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-400 group-hover/item:bg-blue-100 group-hover/item:text-blue-500'}`}>
                                        <MapPin className="w-4 h-4" />
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
