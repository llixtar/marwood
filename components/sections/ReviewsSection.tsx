'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Star, Camera, X, Loader2, Trash2, CheckCircle2, AlertCircle, MessageSquare, Shield, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/store/authStore';
import { getReviews, getUserRatingStatus, addReviewAction, deleteReviewAction, type ReviewItem } from '@/app/actions/reviews';

export function ReviewsSection() {
  const { user, isInitialized } = useAuthStore();
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [stats, setStats] = useState({
    averageRating: 0,
    totalRatingsCount: 0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } as Record<number, number>,
  });

  // Auth & Profile state
  const [hasRated, setHasRated] = useState(false);
  const [existingRating, setExistingRating] = useState<number | null>(null);
  const [profile, setProfile] = useState<any>(null);

  // UI states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Form states
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Lightbox state
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Clamp current page if reviews list changes
  useEffect(() => {
    const totalPages = Math.ceil(reviews.length / itemsPerPage);
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [reviews]);

  // Load reviews and user rating status
  const loadData = async () => {
    setIsLoading(true);
    const reviewsRes = await getReviews();
    if (reviewsRes.success) {
      setReviews(reviewsRes.reviews);
      setStats(reviewsRes.stats);
    }

    if (user) {
      const statusRes = await getUserRatingStatus();
      if (statusRes.success) {
        setHasRated(statusRes.hasRated);
        setExistingRating(statusRes.existingRating);
        setProfile(statusRes.profile);
      }
    } else {
      setHasRated(false);
      setExistingRating(null);
      setProfile(null);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (isInitialized) {
      loadData();
    }
  }, [user, isInitialized]);

  // Handle open auth modal
  const handleOpenAuth = () => {
    (window as any).dispatchOpenAuth?.();
  };

  // Handle image files select
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);

      // Limit to max 3 files
      const totalFiles = selectedImages.length + filesArray.length;
      if (totalFiles > 3) {
        setMessage({ type: 'error', text: 'Ви можете прикріпити не більше 3-х зображень.' });
        return;
      }

      // Check size (max 5MB)
      const invalidFile = filesArray.find(f => f.size > 5 * 1024 * 1024);
      if (invalidFile) {
        setMessage({ type: 'error', text: `Файл ${invalidFile.name} перевищує ліміт у 5 МБ.` });
        return;
      }

      setSelectedImages(prev => [...prev, ...filesArray]);

      // Create previews
      const newPreviews = filesArray.map(file => URL.createObjectURL(file));
      setImagePreviews(prev => [...prev, ...newPreviews]);
      setMessage({ type: '', text: '' });
    }
  };

  // Remove previewed image
  const handleRemoveImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));

    // Revoke URL to prevent memory leaks
    URL.revokeObjectURL(imagePreviews[index]);
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Handle review form submission
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      handleOpenAuth();
      return;
    }

    if (!comment.trim()) {
      setMessage({ type: 'error', text: 'Будь ласка, введіть текст коментаря.' });
      return;
    }

    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const formData = new FormData();
      formData.append('comment', comment.trim());

      // Send rating only if the user hasn't rated yet
      if (!hasRated) {
        formData.append('rating', rating.toString());
      }

      selectedImages.forEach(file => {
        formData.append('images', file);
      });

      const res = await addReviewAction(formData);

      if (res.success) {
        setMessage({ type: 'success', text: 'Ваш відгук успішно додано! Дякуємо.' });
        setComment('');
        setSelectedImages([]);
        // Clear object URLs
        imagePreviews.forEach(url => URL.revokeObjectURL(url));
        setImagePreviews([]);

        // Reset to first page so the user sees their new review on top
        setCurrentPage(1);

        // Reload reviews & lock/update rating status
        await loadData();

        // Close form after a short delay
        setTimeout(() => {
          setIsFormOpen(false);
          setMessage({ type: '', text: '' });
        }, 3000);
      } else {
        setMessage({ type: 'error', text: res.error || 'Помилка при додаванні відгуку.' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Виникла непередбачувана помилка.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle admin deletion of a comment
  const handleDeleteReview = async (reviewId: string) => {
    if (!window.confirm('Ви впевнені, що хочете видалити цей коментар?')) return;

    setIsDeletingId(reviewId);
    try {
      const res = await deleteReviewAction(reviewId);
      if (res.success) {
        await loadData();
      } else {
        alert(res.error || 'Помилка при видаленні.');
      }
    } catch (err: any) {
      alert(err.message || 'Помилка видалення.');
    } finally {
      setIsDeletingId(null);
    }
  };

  // Get initials for user avatar
  const getInitials = (name: string | null) => {
    if (!name) return 'К';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  };

  // Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('uk-UA', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  // Calculate percentage for progress bars
  const getProgressPercentage = (count: number) => {
    if (stats.totalRatingsCount === 0) return 0;
    return (count / stats.totalRatingsCount) * 100;
  };

  return (
    <section id="reviews" className="w-full py-16 md:py-24 bg-milky border-t border-bottle/10 scroll-mt-20">
      <div className="container mx-auto px-4 max-w-6xl">

        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-2xl md:text-4xl font-light uppercase tracking-[0.2em] text-bottle mb-4">
            Відгуки наших клієнтів
          </h2>
          <p className="text-sm text-bottle/60 font-sans max-w-md mx-auto leading-relaxed">
            Ми цінуємо думку кожного з вас.
          </p>
        </div>

        {/* Overview Stats Panel */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 bg-white border border-bottle/5 p-8 rounded-sm shadow-sm mb-12">

          {/* Average rating */}
          <div className="flex flex-col items-center justify-center text-center p-4 md:border-r border-bottle/10">
            <span className="text-5xl md:text-6xl font-light font-heading text-bottle mb-2">
              {stats.averageRating > 0 ? stats.averageRating : '0.0'}
            </span>
            <div className="flex items-center gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-5 h-5 ${star <= Math.round(stats.averageRating)
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-gray-200'
                    }`}
                />
              ))}
            </div>
            <p className="text-xs text-bottle/60 uppercase tracking-wider font-semibold font-sans">
              На основі {stats.totalRatingsCount} оцінок
            </p>
          </div>

          {/* Breakdown bars */}
          <div className="flex flex-col gap-2 p-4 md:col-span-2 md:pl-8">
            <h3 className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-bottle/50 mb-2">Розподіл оцінок</h3>
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = stats.distribution[stars] || 0;
              const percent = getProgressPercentage(count);
              return (
                <div key={stars} className="flex items-center gap-3 text-xs">
                  <span className="w-8 text-bottle/70 font-medium flex items-center justify-end gap-1">
                    {stars} <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  </span>
                  <div className="flex-1 h-2 bg-bottle/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-bottle transition-all duration-1000"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span className="w-12 text-bottle/40 font-bold text-right">
                    {count} ({Math.round(percent)}%)
                  </span>
                </div>
              );
            })}
          </div>

        </div>

        {/* Action Button: Toggle form or prompt auth */}
        <div className="flex justify-center mb-12">
          {!isFormOpen ? (
            <Button
              onClick={() => {
                if (!user) {
                  handleOpenAuth();
                } else {
                  setIsFormOpen(true);
                }
              }}
              className="bg-bottle text-milky hover:bg-bottle/90 px-8 py-3.5 uppercase tracking-widest text-xs font-bold rounded-none shadow-md transition-all duration-300"
            >
              Залишити свій відгук
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={() => setIsFormOpen(false)}
              className="border-bottle/20 text-bottle hover:bg-bottle/5 px-8 py-3.5 uppercase tracking-widest text-xs font-bold rounded-none"
            >
              Скасувати
            </Button>
          )}
        </div>

        {/* Add Review Form Block */}
        {isFormOpen && (
          <div className="bg-white border border-bottle/10 p-6 md:p-10 max-w-2xl mx-auto mb-16 shadow-lg rounded-sm animate-in fade-in slide-in-from-top-4 duration-300">
            <h3 className="text-lg font-light uppercase tracking-widest text-bottle mb-6 border-b border-bottle/10 pb-3">
              Ваш відгук про Marwood
            </h3>

            <form onSubmit={handleSubmitReview} className="space-y-6">

              {message.text && (
                <div className={`p-4 text-xs flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                  }`}>
                  {message.type === 'success' ? <CheckCircle2 className="w-4.5 h-4.5 flex-shrink-0" /> : <AlertCircle className="w-4.5 h-4.5 flex-shrink-0" />}
                  <span>{message.text}</span>
                </div>
              )}

              {/* Star Rating Selection */}
              <div>
                <label className="text-[10px] uppercase tracking-widest font-bold text-bottle/50 mb-2 block">
                  Ваша оцінка магазину
                </label>

                {hasRated ? (
                  <div className="p-4 bg-bottle/5 border border-dashed border-bottle/15 rounded-sm flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-bottle/60 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-bottle/70 leading-relaxed">
                        Ви вже поставили оцінку **{existingRating}★** нашому бренду раніше.
                      </p>
                      <p className="text-[10px] text-bottle/40 uppercase tracking-wider font-bold mt-1">
                        Зараз ви можете залишити додатковий текстовий відгук або запитання.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 py-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 hover:scale-110 transition-transform active:scale-95"
                      >
                        <Star
                          className={`w-8 h-8 transition-colors ${star <= (hoverRating || rating)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-gray-200'
                            }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs text-bottle/50 uppercase tracking-widest font-bold ml-3 font-sans">
                      {rating === 5 && 'Відмінно! 😍'}
                      {rating === 4 && 'Добре! 🙂'}
                      {rating === 3 && 'Задовільно 😐'}
                      {rating === 2 && 'Погано ☹️'}
                      {rating === 1 && 'Жахливо 😡'}
                    </span>
                  </div>
                )}
              </div>

              {/* Comment Text */}
              <div>
                <label className="text-[10px] uppercase tracking-widest font-bold text-bottle/50 mb-2 block">
                  Коментар / Повідомлення
                </label>
                <textarea
                  required
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                  maxLength={1000}
                  className="w-full border border-bottle/10 p-4 text-sm font-sans focus:border-bottle focus:outline-none transition-colors placeholder:text-bottle/30 rounded-none"
                  placeholder="Розкажіть про якість білизни, сервіс доставки чи ваші враження від покупки..."
                />
                <div className="flex justify-end mt-1 text-[10px] text-bottle/40 font-bold uppercase">
                  {comment.length} / 1000 символів
                </div>
              </div>

              {/* Custom Image Uploader */}
              <div>
                <label className="text-[10px] uppercase tracking-widest font-bold text-bottle/50 mb-2 block">
                  Прикріпити фото (макс. 3 зображення)
                </label>

                <div className="flex flex-wrap gap-4 items-center mt-2">
                  {/* Previews */}
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative w-20 h-20 border border-bottle/10 rounded-sm overflow-hidden bg-gray-50 flex-shrink-0">
                      <Image
                        src={preview}
                        alt={`Preview ${index}`}
                        fill
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-1 right-1 bg-black/60 hover:bg-black text-white p-0.5 rounded-full shadow-md transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}

                  {/* Add button */}
                  {selectedImages.length < 3 && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-20 h-20 border border-dashed border-bottle/20 hover:border-bottle/40 hover:bg-bottle/5 flex flex-col items-center justify-center gap-1 transition-all rounded-sm flex-shrink-0 cursor-pointer"
                    >
                      <Camera className="w-5 h-5 text-bottle/40 hover:text-bottle/60" />
                      <span className="text-[9px] uppercase tracking-wider font-bold text-bottle/40">Додати фото</span>
                    </button>
                  )}
                </div>

                <input
                  type="file"
                  multiple
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  className="hidden"
                />
                <p className="text-[9px] text-bottle/40 uppercase tracking-tighter mt-2">
                  Дозволені формати: JPG, PNG, WEBP. Максимум 5 МБ на файл.
                </p>
              </div>

              {/* Submit button */}
              <div className="pt-4 border-t border-bottle/5 flex justify-end">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-bottle text-milky hover:bg-bottle/90 px-8 py-3 uppercase tracking-widest text-[10px] font-bold rounded-none disabled:opacity-50 min-w-[150px] flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Надсилання...
                    </>
                  ) : (
                    'Надіслати відгук'
                  )}
                </Button>
              </div>

            </form>
          </div>
        )}

        {/* Loading state */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-bottle/50 gap-2">
            <Loader2 className="w-8 h-8 animate-spin" />
            <p className="text-xs uppercase tracking-widest font-medium">Завантаження відгуків...</p>
          </div>
        ) : reviews.length === 0 ? (
          /* Empty state */
          <div className="text-center py-16 border border-dashed border-bottle/10 bg-white p-8 rounded-sm">
            <MessageSquare className="w-8 h-8 mx-auto text-bottle/20 mb-3" />
            <p className="text-sm text-bottle/40 italic font-sans mb-4">Відгуків поки немає. Будьте першими, хто поділиться враженнями!</p>
            {!user && (
              <button
                onClick={handleOpenAuth}
                className="text-bottle underline text-xs font-bold uppercase tracking-wider hover:text-bottle/80"
              >
                Увійти, щоб написати
              </button>
            )}
          </div>
        ) : (
          /* Reviews List - Single Column Stack */
          <div className="max-w-4xl mx-auto flex flex-col gap-6 w-full">
            {reviews
              .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
              .map((rev) => {
                const isAdminReview = rev.customer_profiles?.is_admin || false;

                return (
                  <div
                    key={rev.id}
                    className="bg-white border border-bottle/5 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between rounded-sm relative w-full"
                  >

                    {/* Admin moderation trash button (displayed if active user is admin) */}
                    {profile?.is_admin && (
                      <button
                        onClick={() => handleDeleteReview(rev.id)}
                        disabled={isDeletingId === rev.id}
                        className="absolute top-4 right-4 text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded transition-all shadow-sm border border-red-100 flex items-center justify-center bg-white"
                        title="Видалити відгук (модерація)"
                      >
                        {isDeletingId === rev.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4 text-red-500" />
                        )}
                      </button>
                    )}

                    {/* Header: User Info & Stars */}
                    <div>
                      <div className="flex items-center gap-3 mb-4">

                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-full bg-bottle text-milky flex items-center justify-center font-bold text-xs shadow-inner flex-shrink-0">
                          {getInitials(rev.customer_profiles?.full_name || null)}
                        </div>

                        {/* Name, Date, Verified Badge */}
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-xs text-bottle leading-none">
                              {rev.customer_profiles?.full_name || 'Клієнт Marwood'}
                            </span>

                            {isAdminReview ? (
                              <span className="bg-bottle/10 text-bottle text-[8px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-0.5 font-sans">
                                <Shield className="w-2.5 h-2.5" /> Адмін
                              </span>
                            ) : (
                              <span className="bg-green-50 text-green-700 text-[8px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider font-sans">
                                Клієнт
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-bottle/40 font-medium block mt-1">
                            {formatDate(rev.created_at)}
                          </span>
                        </div>

                      </div>

                      {/* Review stars */}
                      {rev.rating !== null && (
                        <div className="flex items-center gap-0.5 mb-3">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${star <= rev.rating!
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-gray-100'
                                }`}
                            />
                          ))}
                        </div>
                      )}

                      {/* Review comment */}
                      <p className="text-sm text-bottle/80 font-sans leading-relaxed whitespace-pre-line mb-4 font-normal">
                        {rev.comment}
                      </p>
                    </div>

                    {/* Review photos */}
                    {rev.images && rev.images.length > 0 && (
                      <div className="flex gap-2.5 flex-wrap pt-2 border-t border-bottle/5 mt-auto">
                        {rev.images.map((imgUrl, i) => (
                          <div
                            key={i}
                            onClick={() => setLightboxImage(imgUrl)}
                            className="relative w-16 h-16 border border-bottle/10 overflow-hidden bg-gray-50 rounded-sm cursor-zoom-in hover:opacity-90 active:scale-95 transition-all group"
                          >
                            <Image
                              src={imgUrl}
                              alt={`Review photo ${i}`}
                              fill
                              className="object-cover"
                            />
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <ExternalLink className="w-3.5 h-3.5 text-white" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                  </div>
                );
              })}

            {/* Pagination Controls */}
            {Math.ceil(reviews.length / itemsPerPage) > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="w-10 h-10 border border-bottle/10 text-bottle disabled:opacity-30 disabled:cursor-not-allowed hover:bg-bottle/5 transition-colors flex items-center justify-center bg-white"
                  title="Попередня сторінка"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: Math.ceil(reviews.length / itemsPerPage) }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-10 h-10 text-xs font-bold transition-all flex items-center justify-center ${currentPage === pageNum
                      ? 'bg-bottle text-milky'
                      : 'border border-bottle/10 text-bottle hover:bg-bottle/5 bg-white'
                      }`}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, Math.ceil(reviews.length / itemsPerPage)))}
                  disabled={currentPage === Math.ceil(reviews.length / itemsPerPage)}
                  className="w-10 h-10 border border-bottle/10 text-bottle disabled:opacity-30 disabled:cursor-not-allowed hover:bg-bottle/5 transition-colors flex items-center justify-center bg-white"
                  title="Наступна сторінка"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Immersive Image Lightbox Overlay */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 cursor-zoom-out animate-in fade-in duration-300"
        >
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute top-6 right-6 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2.5 rounded-full transition-all"
            title="Закрити перегляд"
          >
            <X className="w-6 h-6" />
          </button>

          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl max-h-[85vh] w-full h-full flex items-center justify-center"
          >
            <img
              src={lightboxImage}
              alt="Zoomed Review Image"
              className="max-w-full max-h-full object-contain shadow-2xl rounded-sm border border-white/5 animate-in zoom-in-95 duration-300"
            />
          </div>
        </div>
      )}

    </section>
  );
}
