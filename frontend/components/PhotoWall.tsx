"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Camera, Heart, MessageCircle, Award, X, Send, Upload } from "lucide-react";
import { toast } from "sonner";
import { useGamification } from "@/context/GamificationContext";

interface Comment {
    id: number;
    username: string;
    text: string;
    timestamp: Date;
}

interface Photo {
    id: number;
    imageUrl: string;
    username: string;
    foodName: string;
    location: string;
    likes: number;
    comments: Comment[];
    isLiked: boolean;
    isPhotoOfWeek?: boolean;
}

const PHOTO_STORAGE_KEY = "community_photos";

const revivePhotos = (rawPhotos: unknown): Photo[] => {
    if (!Array.isArray(rawPhotos)) {
        return [];
    }

    return rawPhotos
        .flatMap((photo): Photo[] => {
            if (!photo || typeof photo !== "object") {
                return [];
            }

            const candidate = photo as Partial<Photo> & { comments?: Array<Partial<Comment>> };
            if (!candidate.id || !candidate.imageUrl || !candidate.foodName || !candidate.location || !candidate.username) {
                return [];
            }

            const comments: Comment[] = Array.isArray(candidate.comments)
                ? candidate.comments.flatMap((comment): Comment[] => {
                    if (!comment || typeof comment !== "object" || !comment.id || !comment.username || !comment.text) {
                        return [];
                    }

                    return [{
                        id: Number(comment.id),
                        username: String(comment.username),
                        text: String(comment.text),
                        timestamp: comment.timestamp ? new Date(comment.timestamp) : new Date()
                    }];
                })
                : [];

            return [{
                id: candidate.id,
                imageUrl: candidate.imageUrl,
                username: candidate.username,
                foodName: candidate.foodName,
                location: candidate.location,
                likes: typeof candidate.likes === "number" ? candidate.likes : 0,
                comments,
                isLiked: Boolean(candidate.isLiked),
                isPhotoOfWeek: candidate.isPhotoOfWeek ? Boolean(candidate.isPhotoOfWeek) : undefined
            }];
        });
};

export function PhotoWall() {
    const { performAction } = useGamification();
    const [photos, setPhotos] = useState<Photo[]>(() => {
        if (typeof window === "undefined") {
            return [];
        }

        const savedPhotos = window.localStorage.getItem(PHOTO_STORAGE_KEY);
        if (!savedPhotos) {
            return [];
        }

        try {
            return revivePhotos(JSON.parse(savedPhotos));
        } catch {
            window.localStorage.removeItem(PHOTO_STORAGE_KEY);
            return [];
        }
    });
    const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [newPhoto, setNewPhoto] = useState({ foodName: "", location: "", imageUrl: "" });
    const [newComment, setNewComment] = useState("");

    useEffect(() => {
        localStorage.setItem(PHOTO_STORAGE_KEY, JSON.stringify(photos));
    }, [photos]);

    const handleLike = (photoId: number, e?: React.MouseEvent) => {
        e?.stopPropagation();
        setPhotos((currentPhotos) => {
            const updatedPhotos = currentPhotos.map((photo) => {
                if (photo.id === photoId) {
                    const newIsLiked = !photo.isLiked;
                    return {
                        ...photo,
                        isLiked: newIsLiked,
                        likes: newIsLiked ? photo.likes + 1 : Math.max(photo.likes - 1, 0)
                    };
                }

                return photo;
            });

            if (selectedPhoto) {
                const updatedSelectedPhoto = updatedPhotos.find((photo) => photo.id === selectedPhoto.id) ?? null;
                setSelectedPhoto(updatedSelectedPhoto);
            }

            return updatedPhotos;
        });

        const photo = photos.find(p => p.id === photoId);
        if (photo && !photo.isLiked) {
            toast.success(`Liked ${photo.foodName}`);
        }
    };

    const handleAddComment = (photoId: number) => {
        if (!newComment.trim()) return;

        const comment: Comment = {
            id: Date.now(),
            username: "you", // In real app, get from auth
            text: newComment,
            timestamp: new Date()
        };

        setPhotos((currentPhotos) => {
            const updatedPhotos = currentPhotos.map((photo) => (
                photo.id === photoId
                    ? {
                        ...photo,
                        comments: [...photo.comments, comment]
                    }
                    : photo
            ));

            if (selectedPhoto) {
                const updatedSelectedPhoto = updatedPhotos.find((photo) => photo.id === selectedPhoto.id) ?? null;
                setSelectedPhoto(updatedSelectedPhoto);
            }

            return updatedPhotos;
        });

        setNewComment("");
        performAction('complete_challenge'); // XP for commenting
        toast.success("Comment added");
    };

    const handleUploadSubmit = () => {
        if (!newPhoto.foodName || !newPhoto.location || !newPhoto.imageUrl) {
            toast.error("Add the food name, location, and image URL");
            return;
        }

        const photo: Photo = {
            id: Date.now(),
            imageUrl: newPhoto.imageUrl,
            username: "you",
            foodName: newPhoto.foodName,
            location: newPhoto.location,
            likes: 0,
            comments: [],
            isLiked: false
        };

        setPhotos((currentPhotos) => [photo, ...currentPhotos]);
        setIsUploadOpen(false);
        setNewPhoto({ foodName: "", location: "", imageUrl: "" });

        performAction('complete_challenge'); // XP for uploading
        toast.success("Photo saved on this device");
    };

    const openLightbox = (photo: Photo) => {
        setSelectedPhoto(photo);
    };

    const closeLightbox = () => {
        setSelectedPhoto(null);
    };

    return (
        <>
            <Card className="hover:shadow-lg transition-shadow border-primary/10">
                <CardHeader className="bg-gradient-to-r from-pink-50 to-emerald-50">
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Camera className="w-5 h-5 text-pink-500" />
                                Foodie Photo Wall
                            </CardTitle>
                            <p className="text-xs text-muted-foreground mt-1">
                                Community's best street food captures
                            </p>
                        </div>

                        <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                            <DialogTrigger asChild>
                                <Button size="sm" className="bg-gradient-to-r from-pink-500 to-emerald-500 hover:from-pink-600 hover:to-emerald-600">
                                    <Camera className="w-4 h-4 mr-2" />
                                    Upload
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Share a food photo</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Food Name</label>
                                        <Input
                                            placeholder="e.g. Spicy Vada Pav"
                                            value={newPhoto.foodName}
                                            onChange={e => setNewPhoto({ ...newPhoto, foodName: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Location</label>
                                        <Input
                                            placeholder="e.g. Dadar Station"
                                            value={newPhoto.location}
                                            onChange={e => setNewPhoto({ ...newPhoto, location: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Image URL</label>
                                        <Input
                                            placeholder="https://..."
                                            value={newPhoto.imageUrl}
                                            onChange={e => setNewPhoto({ ...newPhoto, imageUrl: e.target.value })}
                                        />
                                        <p className="text-xs text-muted-foreground">Photos are stored in this browser until live uploads are connected.</p>
                                    </div>
                                    <Button className="w-full" onClick={handleUploadSubmit}>
                                        <Upload className="w-4 h-4 mr-2" />
                                        Post Photo
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardHeader>

                <CardContent className="pt-6">
                    {photos.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-pink-200 bg-pink-50/70 px-5 py-8 text-center">
                            <Camera className="mx-auto mb-3 h-10 w-10 text-pink-500" />
                            <h4 className="text-sm font-semibold text-gray-900">No community photos yet</h4>
                            <p className="mt-2 text-sm text-muted-foreground">
                                This wall stays empty until users add photos from this browser.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {photos.map((photo) => (
                                    <div
                                        key={photo.id}
                                        onClick={() => openLightbox(photo)}
                                        className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group"
                                    >
                                        <img
                                            src={photo.imageUrl}
                                            alt={photo.foodName}
                                            className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                        />

                                        {photo.isPhotoOfWeek && (
                                            <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
                                                <Award className="w-3 h-3" />
                                                POTW
                                            </div>
                                        )}

                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                                                <h4 className="font-bold text-sm">{photo.foodName}</h4>
                                                <p className="text-xs opacity-90">by {photo.username}</p>
                                                <div className="flex gap-3 mt-2 text-xs">
                                                    <span className="flex items-center gap-1">
                                                        <Heart className="w-3 h-3" />
                                                        {photo.likes}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <MessageCircle className="w-3 h-3" />
                                                        {photo.comments.length}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <p className="text-xs text-center text-muted-foreground mt-4 bg-pink-50 p-2 rounded-lg">
                                Click on a photo to view details or add a comment.
                            </p>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Lightbox Modal */}
            {selectedPhoto && (
                <div
                    className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
                    onClick={closeLightbox}
                >
                    <div
                        className="relative bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col md:flex-row"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white md:hidden"
                            onClick={closeLightbox}
                        >
                            <X className="w-5 h-5" />
                        </Button>

                        {/* Image Section */}
                        <div className="w-full md:w-1/2 bg-black flex items-center justify-center">
                            <img
                                src={selectedPhoto.imageUrl}
                                alt={selectedPhoto.foodName}
                                className="w-full h-full object-contain max-h-[50vh] md:max-h-full"
                            />
                        </div>

                        {/* Details Section */}
                        <div className="w-full md:w-1/2 p-6 flex flex-col h-full overflow-hidden">
                            <div className="flex-shrink-0 mb-4">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="text-2xl font-bold">{selectedPhoto.foodName}</h3>
                                        <p className="text-sm text-muted-foreground">{selectedPhoto.location}</p>
                                        <p className="text-sm text-muted-foreground">by @{selectedPhoto.username}</p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="hidden md:flex"
                                        onClick={closeLightbox}
                                    >
                                        <X className="w-5 h-5" />
                                    </Button>
                                </div>
                            </div>

                            {/* Comments List */}
                            <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
                                <h4 className="font-bold text-sm">Comments ({selectedPhoto.comments.length})</h4>
                                {selectedPhoto.comments.length === 0 ? (
                                    <p className="text-sm text-muted-foreground italic">No comments yet. Be the first!</p>
                                ) : (
                                    selectedPhoto.comments.map(comment => (
                                        <div key={comment.id} className="text-sm bg-gray-50 p-2 rounded-lg">
                                            <span className="font-bold mr-2">{comment.username}</span>
                                            <span className="text-gray-700">{comment.text}</span>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Action Bar */}
                            <div className="flex-shrink-0 pt-4 border-t">
                                <div className="flex gap-3 mb-4">
                                    <Button
                                        variant={selectedPhoto.isLiked ? "default" : "outline"}
                                        size="sm"
                                        onClick={(e) => handleLike(selectedPhoto.id, e)}
                                        className={`flex-1 ${selectedPhoto.isLiked ? "bg-red-500 hover:bg-red-600" : ""}`}
                                    >
                                        <Heart className={`w-4 h-4 mr-2 ${selectedPhoto.isLiked ? 'fill-current' : ''}`} />
                                        {selectedPhoto.likes} Likes
                                    </Button>
                                </div>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Add a comment..."
                                        value={newComment}
                                        onChange={e => setNewComment(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleAddComment(selectedPhoto.id)}
                                    />
                                    <Button size="icon" onClick={() => handleAddComment(selectedPhoto.id)}>
                                        <Send className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
