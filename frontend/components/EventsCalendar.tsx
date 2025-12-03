"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Clock, Users, ChevronLeft, ChevronRight, X } from "lucide-react";
import { toast } from "sonner";

interface Event {
    id: number;
    title: string;
    date: Date;
    time: string;
    location: string;
    type: "festival" | "popup" | "meetup" | "tour";
    attendees: number;
    description: string;
    emoji: string;
}

const SAMPLE_EVENTS: Event[] = [
    {
        id: 1,
        title: "Mumbai Street Food Festival",
        date: new Date(2025, 11, 5),
        time: "10:00 AM - 8:00 PM",
        location: "Juhu Beach, Mumbai",
        type: "festival",
        attendees: 2500,
        description: "Annual street food festival featuring 50+ vendors from across Mumbai",
        emoji: "🎪"
    },
    {
        id: 2,
        title: "Chaat Master Pop-up",
        date: new Date(2025, 11, 8),
        time: "6:00 PM - 10:00 PM",
        location: "Connaught Place, Delhi",
        type: "popup",
        attendees: 150,
        description: "Limited time pop-up by award-winning chaat vendor",
        emoji: "🥟"
    },
    {
        id: 3,
        title: "Foodie Community Meetup",
        date: new Date(2025, 11, 12),
        time: "7:00 PM - 9:00 PM",
        location: "FC Road, Pune",
        type: "meetup",
        attendees: 45,
        description: "Monthly gathering of street food enthusiasts",
        emoji: "👥"
    },
    {
        id: 4,
        title: "Heritage Food Walk",
        date: new Date(2025, 11, 15),
        time: "9:00 AM - 12:00 PM",
        location: "Old City, Hyderabad",
        type: "tour",
        attendees: 30,
        description: "Guided tour of historic street food spots",
        emoji: "🚶"
    },
    {
        id: 5,
        title: "Dosa & Filter Coffee Fest",
        date: new Date(2025, 11, 20),
        time: "8:00 AM - 2:00 PM",
        location: "Brigade Road, Bangalore",
        type: "festival",
        attendees: 800,
        description: "South Indian breakfast festival",
        emoji: "☕"
    },
    {
        id: 6,
        title: "Midnight Maggi Party",
        date: new Date(2025, 11, 22),
        time: "11:00 PM - 2:00 AM",
        location: "Marine Drive, Mumbai",
        type: "meetup",
        attendees: 120,
        description: "Late night Maggi and stories by the sea",
        emoji: "🍜"
    },
    {
        id: 7,
        title: "Kebab & Biryani Night",
        date: new Date(2025, 11, 25),
        time: "7:00 PM - 11:00 PM",
        location: "Lucknow Chowk",
        type: "festival",
        attendees: 1500,
        description: "A royal feast of kebabs and biryanis",
        emoji: "🍖"
    },
    {
        id: 8,
        title: "Vegan Street Food Tour",
        date: new Date(2025, 11, 28),
        time: "4:00 PM - 7:00 PM",
        location: "Bandra, Mumbai",
        type: "tour",
        attendees: 25,
        description: "Exploring the best vegan street eats",
        emoji: "🥗"
    }
];

const EVENT_COLORS = {
    festival: "from-purple-500 to-pink-500",
    popup: "from-orange-500 to-red-500",
    meetup: "from-blue-500 to-cyan-500",
    tour: "from-green-500 to-emerald-500"
};

export function EventsCalendar() {
    const [currentDate, setCurrentDate] = useState(new Date(2025, 11, 1)); // December 2025
    const [events, setEvents] = useState<Event[]>(SAMPLE_EVENTS);
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

    const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

    const getEventsForDay = (day: number) => {
        return events.filter(event =>
            event.date.getDate() === day &&
            event.date.getMonth() === currentDate.getMonth() &&
            event.date.getFullYear() === currentDate.getFullYear()
        );
    };

    const handlePreviousMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const handleRSVP = (event: Event) => {
        toast.success(`RSVP'd to ${event.title}! 🎉`);
    };

    return (
        <>
            <Card className="hover:shadow-lg transition-shadow border-primary/10">
                <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Calendar className="w-5 h-5 text-indigo-500" />
                                Events Calendar
                            </CardTitle>
                            <p className="text-xs text-muted-foreground mt-1">
                                Street food festivals & meetups
                            </p>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="pt-6 space-y-4">
                    {/* Month Navigation */}
                    <div className="flex items-center justify-between">
                        <Button variant="outline" size="icon" onClick={handlePreviousMonth}>
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <h3 className="text-lg font-bold text-gray-800">{monthName}</h3>
                        <Button variant="outline" size="icon" onClick={handleNextMonth}>
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>

                    {/* Calendar Grid */}
                    <div className="space-y-2">
                        {/* Weekday headers */}
                        <div className="grid grid-cols-7 gap-1">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                <div key={day} className="text-center text-xs font-bold text-gray-500 p-2">
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Calendar days */}
                        <div className="grid grid-cols-7 gap-1">
                            {[...Array(firstDayOfMonth)].map((_, index) => (
                                <div key={`empty-${index}`} className="aspect-square" />
                            ))}
                            {[...Array(daysInMonth)].map((_, index) => {
                                const day = index + 1;
                                const dayEvents = getEventsForDay(day);
                                const hasEvents = dayEvents.length > 0;

                                return (
                                    <button
                                        key={day}
                                        onClick={() => hasEvents && setSelectedEvent(dayEvents[0])}
                                        className={`aspect-square rounded-lg border p-1 text-sm transition-all ${hasEvents
                                            ? "border-indigo-300 bg-indigo-50 hover:bg-indigo-100 cursor-pointer"
                                            : "border-gray-200 bg-white"
                                            }`}
                                    >
                                        <div className="font-medium">{day}</div>
                                        {hasEvents && (
                                            <div className="flex justify-center mt-1">
                                                {dayEvents.slice(0, 2).map(event => (
                                                    <div key={event.id} className="w-1.5 h-1.5 rounded-full bg-indigo-500 mx-0.5" />
                                                ))}
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Upcoming Events List */}
                    <div className="space-y-2">
                        <h4 className="text-sm font-bold text-gray-700">Upcoming Events</h4>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                            {events.slice(0, 3).map(event => (
                                <button
                                    key={event.id}
                                    onClick={() => setSelectedEvent(event)}
                                    className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="text-2xl">{event.emoji}</div>
                                        <div className="flex-1">
                                            <h5 className="font-bold text-sm">{event.title}</h5>
                                            <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {event.date.toLocaleDateString()}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Users className="w-3 h-3" />
                                                    {event.attendees}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Event Details Modal */}
            {selectedEvent && (
                <div
                    className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
                    onClick={() => setSelectedEvent(null)}
                >
                    <div
                        className="relative bg-white rounded-2xl max-w-lg w-full overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-4 right-4 z-10"
                            onClick={() => setSelectedEvent(null)}
                        >
                            <X className="w-5 h-5" />
                        </Button>

                        <div className={`h-32 bg-gradient-to-r ${EVENT_COLORS[selectedEvent.type]} flex items-center justify-center`}>
                            <div className="text-6xl">{selectedEvent.emoji}</div>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <div className="inline-block px-2 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold mb-2">
                                    {selectedEvent.type.toUpperCase()}
                                </div>
                                <h3 className="text-2xl font-bold">{selectedEvent.title}</h3>
                                <p className="text-sm text-muted-foreground mt-2">{selectedEvent.description}</p>
                            </div>

                            <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Calendar className="w-4 h-4" />
                                    {selectedEvent.date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Clock className="w-4 h-4" />
                                    {selectedEvent.time}
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <MapPin className="w-4 h-4" />
                                    {selectedEvent.location}
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Users className="w-4 h-4" />
                                    {selectedEvent.attendees} people interested
                                </div>
                            </div>

                            <Button
                                className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
                                onClick={() => handleRSVP(selectedEvent)}
                            >
                                RSVP to Event
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
