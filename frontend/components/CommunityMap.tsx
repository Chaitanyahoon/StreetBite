"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Locate, MapPin, Navigation, Sparkles, Star } from "lucide-react";
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

interface NewPinDraft {
  name: string;
  foodType: string;
  lat: string;
  lng: string;
  emoji: string;
  addedBy: string;
}

const SAMPLE_PINS: FoodPin[] = [
  { id: 1, name: "Raghu's Vada Pav", foodType: "Street Food", lat: 19.076, lng: 72.8777, rating: 4.8, addedBy: "foodie_raj", emoji: "🥪" },
  { id: 2, name: "Sharma Ji's Chaat", foodType: "Chaat", lat: 28.6139, lng: 77.209, rating: 4.9, addedBy: "delhi_eats", emoji: "🥟" },
  { id: 3, name: "Lakshmi's Dosa Corner", foodType: "South Indian", lat: 12.9716, lng: 77.5946, rating: 4.7, addedBy: "dosa_king", emoji: "🥞" },
  { id: 4, name: "Khan's Kebab House", foodType: "Kebab", lat: 26.8467, lng: 80.9462, rating: 4.6, addedBy: "kebab_lover", emoji: "🍖" },
  { id: 5, name: "Mohan's Misal", foodType: "Maharashtrian", lat: 18.5204, lng: 73.8567, rating: 4.8, addedBy: "pune_foodie", emoji: "🍲" },
];

const FOOD_TYPES = ["All", "Street Food", "Chaat", "South Indian", "Kebab", "Maharashtrian"] as const;

const MAP_BOUNDS = {
  minLat: 8,
  maxLat: 37,
  minLng: 68,
  maxLng: 97,
};

const DEFAULT_NEW_PIN: NewPinDraft = {
  name: "",
  foodType: "Street Food",
  lat: "19.0760",
  lng: "72.8777",
  emoji: "🍜",
  addedBy: "",
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function projectPinToMap(lat: number, lng: number) {
  const x = ((clamp(lng, MAP_BOUNDS.minLng, MAP_BOUNDS.maxLng) - MAP_BOUNDS.minLng) /
    (MAP_BOUNDS.maxLng - MAP_BOUNDS.minLng)) * 100;
  const y = ((MAP_BOUNDS.maxLat - clamp(lat, MAP_BOUNDS.minLat, MAP_BOUNDS.maxLat)) /
    (MAP_BOUNDS.maxLat - MAP_BOUNDS.minLat)) * 100;

  return { x, y };
}

export function CommunityMap() {
  const [pins, setPins] = useState<FoodPin[]>(SAMPLE_PINS);
  const [selectedFilter, setSelectedFilter] = useState<(typeof FOOD_TYPES)[number]>("All");
  const [selectedPin, setSelectedPin] = useState<FoodPin | null>(SAMPLE_PINS[0] ?? null);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [newPin, setNewPin] = useState<NewPinDraft>(DEFAULT_NEW_PIN);

  const filteredPins = useMemo(
    () => (selectedFilter === "All" ? pins : pins.filter((pin) => pin.foodType === selectedFilter)),
    [pins, selectedFilter]
  );
  const foodTypeCounts = useMemo(() => {
    const counts: Partial<Record<(typeof FOOD_TYPES)[number], number>> = {};
    FOOD_TYPES.forEach((type) => {
      counts[type] = type === "All" ? pins.length : pins.filter((pin) => pin.foodType === type).length;
    });
    return counts;
  }, [pins]);
  const topRatedVisiblePin = useMemo(() => {
    if (filteredPins.length === 0) {
      return null;
    }
    return [...filteredPins].sort((left, right) => right.rating - left.rating)[0] ?? null;
  }, [filteredPins]);
  const activeSelectedPin = useMemo(() => {
    if (!selectedPin) {
      return filteredPins[0] ?? null;
    }
    const visibleSelected = filteredPins.find((pin) => pin.id === selectedPin.id);
    return visibleSelected ?? filteredPins[0] ?? null;
  }, [filteredPins, selectedPin]);
  const selectedPinPoint = useMemo(() => {
    if (!activeSelectedPin) {
      return null;
    }
    return projectPinToMap(activeSelectedPin.lat, activeSelectedPin.lng);
  }, [activeSelectedPin]);

  const handlePinClick = (pin: FoodPin) => {
    setSelectedPin((prev) => {
      const currentSelectedId = prev?.id ?? activeSelectedPin?.id;
      return currentSelectedId === pin.id ? null : pin;
    });
  };

  const toggleAddPin = () => {
    setIsAddFormOpen((prev) => !prev);
  };

  const handleAddPin = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const lat = Number.parseFloat(newPin.lat);
    const lng = Number.parseFloat(newPin.lng);

    if (!newPin.name.trim()) {
      toast.error("Pin name is required");
      return;
    }

    if (!newPin.addedBy.trim()) {
      toast.error("Username is required");
      return;
    }

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      toast.error("Latitude and longitude must be valid numbers");
      return;
    }

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      toast.error("Coordinates are out of valid range");
      return;
    }

    const rating = Math.round((4.5 + Math.random() * 0.5) * 10) / 10;
    const nextId = Math.max(0, ...pins.map((pin) => pin.id)) + 1;

    const createdPin: FoodPin = {
      id: nextId,
      name: newPin.name.trim(),
      foodType: newPin.foodType,
      lat,
      lng,
      rating,
      addedBy: newPin.addedBy.trim().replace(/^@+/, ""),
      emoji: newPin.emoji.trim() || "🍜",
    };

    setPins((prev) => [createdPin, ...prev]);
    setSelectedFilter(createdPin.foodType as (typeof FOOD_TYPES)[number]);
    setSelectedPin(createdPin);
    setNewPin(DEFAULT_NEW_PIN);
    setIsAddFormOpen(false);

    toast.success("New hotspot pinned!", {
      description: `${createdPin.name} added to the food map.`,
    });
  };

  return (
    <Card className="hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white overflow-hidden group rounded-[2rem]">
      <CardHeader className="bg-blue-400 border-b-4 border-black py-5 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
        <div className="flex justify-between items-start relative z-10 gap-3">
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
          <Button
            size="sm"
            onClick={toggleAddPin}
            className="bg-white text-black font-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-gray-100"
          >
            <MapPin className="w-4 h-4 mr-2" />
            {isAddFormOpen ? "Close" : "Add Pin"}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-6 space-y-5 px-5">
        {isAddFormOpen ? (
          <form
            onSubmit={handleAddPin}
            className="border-2 border-black rounded-2xl p-4 bg-blue-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-3"
          >
            <h4 className="text-xs font-black uppercase tracking-wider">Add a community hotspot</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input
                value={newPin.name}
                onChange={(e) => setNewPin((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Stall name"
                className="border-2 border-black font-bold bg-white"
                required
              />
              <Input
                value={newPin.addedBy}
                onChange={(e) => setNewPin((prev) => ({ ...prev, addedBy: e.target.value }))}
                placeholder="Your username"
                className="border-2 border-black font-bold bg-white"
                required
              />
              <select
                value={newPin.foodType}
                onChange={(e) => setNewPin((prev) => ({ ...prev, foodType: e.target.value }))}
                className="h-10 rounded-md border-2 border-black px-3 text-sm font-bold bg-white"
              >
                {FOOD_TYPES.filter((type) => type !== "All").map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <Input
                value={newPin.emoji}
                onChange={(e) => setNewPin((prev) => ({ ...prev, emoji: e.target.value }))}
                placeholder="Emoji (e.g. 🍜)"
                className="border-2 border-black font-bold bg-white"
              />
              <Input
                value={newPin.lat}
                onChange={(e) => setNewPin((prev) => ({ ...prev, lat: e.target.value }))}
                placeholder="Latitude"
                className="border-2 border-black font-bold bg-white"
                required
              />
              <Input
                value={newPin.lng}
                onChange={(e) => setNewPin((prev) => ({ ...prev, lng: e.target.value }))}
                placeholder="Longitude"
                className="border-2 border-black font-bold bg-white"
                required
              />
            </div>
            <div className="flex justify-end">
              <Button
                type="submit"
                className="bg-black text-white font-black border-2 border-black hover:bg-blue-600 uppercase"
              >
                Save Pin
              </Button>
            </div>
          </form>
        ) : null}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          <div className="rounded-xl border-2 border-black bg-white px-3 py-2 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-black/60">Total Pins</p>
            <p className="text-lg font-black text-black">{pins.length}</p>
          </div>
          <div className="rounded-xl border-2 border-black bg-white px-3 py-2 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-black/60">Visible</p>
            <p className="text-lg font-black text-black">{filteredPins.length}</p>
          </div>
          <div className="rounded-xl border-2 border-black bg-white px-3 py-2 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-black/60">Top Rated</p>
            <p className="text-sm font-black text-black truncate">{topRatedVisiblePin ? `${topRatedVisiblePin.rating} ★` : "NA"}</p>
          </div>
          <div className="rounded-xl border-2 border-black bg-white px-3 py-2 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-black/60">Active Filter</p>
            <p className="text-sm font-black text-black truncate">{selectedFilter}</p>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {FOOD_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedFilter(type)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all duration-300 border-2 border-black ${
                selectedFilter === type
                  ? "bg-blue-500 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transform -translate-y-0.5"
                  : "bg-white text-black hover:bg-gray-100 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              }`}
            >
              {type} ({foodTypeCounts[type] ?? 0})
            </button>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)]">
          <div className="space-y-3">
            <div className="relative w-full h-72 lg:h-[28rem] bg-gradient-to-br from-blue-200 via-blue-100 to-cyan-100 rounded-2xl overflow-hidden border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-shadow">
              <div
                className="absolute inset-0 opacity-35"
                style={{
                  backgroundImage:
                    "radial-gradient(#1e3a8a 1.5px, transparent 1.5px), radial-gradient(#1e3a8a 1.5px, transparent 1.5px)",
                  backgroundSize: "20px 20px",
                  backgroundPosition: "0 0, 10px 10px",
                }}
              ></div>
              <div className="absolute top-2 left-2 rounded-lg border-2 border-black bg-white/90 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-black">
                India Food Grid
              </div>
              <div className="absolute top-2 right-2 rounded-lg border-2 border-black bg-white/90 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-black flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Tap a pin
              </div>
              <span className="absolute top-[20%] left-[18%] text-[10px] font-black uppercase tracking-[0.14em] text-black/40">North</span>
              <span className="absolute top-[45%] left-[46%] text-[10px] font-black uppercase tracking-[0.14em] text-black/40">Central</span>
              <span className="absolute bottom-[18%] left-[55%] text-[10px] font-black uppercase tracking-[0.14em] text-black/40">South</span>

              {selectedPinPoint ? (
                <>
                  <div
                    className="absolute -translate-x-1/2 -translate-y-1/2 h-20 w-20 rounded-full border-2 border-blue-500/40 bg-blue-500/20 pointer-events-none"
                    style={{ left: `${selectedPinPoint.x}%`, top: `${selectedPinPoint.y}%` }}
                  />
                  <div
                    className="absolute -translate-x-1/2 -translate-y-1/2 h-12 w-12 rounded-full border-2 border-blue-700/50 bg-blue-500/15 pointer-events-none"
                    style={{ left: `${selectedPinPoint.x}%`, top: `${selectedPinPoint.y}%` }}
                  />
                </>
              ) : null}

              {filteredPins.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center px-4 text-center">
                  <div className="bg-white border-2 border-black rounded-xl px-4 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <p className="text-xs font-black uppercase tracking-wide">No hotspots in this filter yet</p>
                  </div>
                </div>
              ) : (
                filteredPins.map((pin) => {
                  const point = projectPinToMap(pin.lat, pin.lng);
                  const isSelected = activeSelectedPin?.id === pin.id;

                  return (
                    <button
                      key={pin.id}
                      onClick={() => handlePinClick(pin)}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 z-20 rounded-xl border-2 border-black bg-white p-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:scale-110 transition-all ${
                        isSelected ? "ring-4 ring-blue-500/60 scale-110" : ""
                      }`}
                      style={{ left: `${point.x}%`, top: `${point.y}%` }}
                      title={`${pin.name} (${pin.foodType})`}
                    >
                      <span className="text-2xl leading-none">{pin.emoji}</span>
                    </button>
                  );
                })
              )}

              <div className="absolute bottom-3 left-3 bg-white px-3 py-2 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black flex items-center gap-2">
                <Navigation className="w-4 h-4 text-blue-600" />
                <span className="text-[10px] font-black text-black uppercase tracking-wide">
                  {filteredPins.length} spot{filteredPins.length === 1 ? "" : "s"} shown
                </span>
              </div>
            </div>

            {activeSelectedPin ? (
              <div className="border-2 border-black rounded-xl bg-yellow-100 p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-2xl border-2 border-black">
                    {activeSelectedPin.emoji}
                  </div>
                  <div className="min-w-0">
                    <p className="font-black text-sm uppercase truncate">{activeSelectedPin.name}</p>
                    <p className="text-xs font-bold text-gray-700">{activeSelectedPin.foodType}</p>
                    <p className="text-[10px] font-bold text-gray-500">
                      @{activeSelectedPin.addedBy} • {activeSelectedPin.lat.toFixed(4)}, {activeSelectedPin.lng.toFixed(4)}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <div className="space-y-3 rounded-2xl border-2 border-black bg-white p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <h4 className="text-xs font-black text-black uppercase tracking-wider flex items-center gap-2 px-1">
              <Locate className="w-4 h-4" />
              Nearby Hotspots
            </h4>
            <div className="space-y-3 max-h-80 lg:max-h-[26rem] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-black scrollbar-track-gray-100">
              {filteredPins.map((pin) => (
                <button
                  key={pin.id}
                  onClick={() => handlePinClick(pin)}
                  className={`w-full text-left p-3 rounded-xl border-2 transition-all duration-200 group/item ${
                    activeSelectedPin?.id === pin.id
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
                    <div
                      className={`p-2 rounded-full border-2 border-black transition-colors ${
                        activeSelectedPin?.id === pin.id
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 text-gray-400 group-hover/item:bg-blue-100 group-hover/item:text-blue-500"
                      }`}
                    >
                      <MapPin className="w-4 h-4" />
                    </div>
                  </div>
                </button>
              ))}
              {filteredPins.length === 0 ? (
                <div className="rounded-xl border-2 border-dashed border-black bg-gray-50 p-4 text-center">
                  <p className="text-xs font-black uppercase tracking-wider text-black/60">
                    No hotspots in this category
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
