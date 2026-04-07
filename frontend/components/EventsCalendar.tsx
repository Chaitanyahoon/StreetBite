"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin } from "lucide-react";

export function EventsCalendar() {
    return (
        <Card className="hover:shadow-lg transition-shadow border-primary/10">
            <CardHeader className="bg-gradient-to-r from-cyan-50 to-emerald-50">
                <div>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Calendar className="w-5 h-5 text-cyan-500" />
                        Events Calendar
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">
                        Live events will appear here once scheduling is connected.
                    </p>
                </div>
            </CardHeader>

            <CardContent className="pt-6">
                <div className="rounded-2xl border border-dashed border-cyan-200 bg-cyan-50/60 px-5 py-8 text-center">
                    <MapPin className="mx-auto mb-3 h-10 w-10 text-cyan-500" />
                    <h4 className="text-sm font-semibold text-gray-900">No live events scheduled</h4>
                    <p className="mt-2 text-sm text-muted-foreground">
                        This section no longer shows placeholder festivals. It will stay empty until real events come from the backend.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
