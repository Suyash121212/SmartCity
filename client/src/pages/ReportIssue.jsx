import { useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import { Upload, X, Sparkles, MapPin, AlertCircle, CheckCircle2, Loader2, Wand2, Camera } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../lib/api'
import LocationPicker from '../components/Map/LocationPicker'
import { useSocket } from '../context/SocketContext'
import { useAuth } from '../context/AuthContext'
import { CATEGORY_CONFIG } from '../lib/utils'


const CATEGORIES = ['ROAD', 'SANITATION', 'WATER', 'ELECTRICITY', 'OTHER']

export default function ReportIssue() {
  const navigate = useNavigate()
  const { socket } = useSocket()
  const { user } = useAuth()
  const [form, setForm] = useState({
    title: '', description: '', category: 'ROAD',
  })
  const [location, setLocation] = useState(null)
  const [photoUrl, setPhotoUrl] = useState(null)       // Cloudinary URL after upload
  const [photoPreview, setPhotoPreview] = useState(null) // local blob preview
  const [analyzing, setAnalyzing] = useState(false)    // AI analyzing state
  const [aiResult, setAiResult] = useState(null)       // AI analysis result
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  // image selection
  const [selectedImage, setSelectedImage] = useState(null);

  //camera input
  const cameraInputRef = useRef(null);
  // Listen for job progress
  useState(() => {
    if (!socket) return
    socket.on('job:progress', (data) => {
      // handled in submitted state
    })
    return () => socket?.off('job:progress')
  })


  const onDrop = useCallback(async (files) => {
    const file = files[0]
    if (!file) return

    // Show local preview immediately
    setPhotoPreview(URL.createObjectURL(file))
    // setAnalyzing(true)
    setAiResult(null)
    setSelectedImage(file);
  });

  // image capcure
  const handleCameraCapture = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setPhotoPreview(URL.createObjectURL(file));
    setSelectedImage(file);
  };

  //   try {
  //     // Upload to Cloudinary + run Gemini Vision in one call
  //     const formData = new FormData()
  //     formData.append('photo', file)

  //     const res = await api.post('/analyze/image', formData, {
  //       headers: { 'Content-Type': 'multipart/form-data' },
  //     })

  //     setPhotoUrl(res.data.photoUrl)

  //     if (res.data.analysis) {
  //       const ai = res.data.analysis
  //       setAiResult(ai)

  //       // Auto-fill form fields from AI
  //       setForm(prev => ({
  //         ...prev,
  //         title: ai.suggested_title || prev.title,
  //         description: ai.description || prev.description,
  //         category: ai.category || prev.category,
  //       }))

  //       toast.success('✨ AI detected the issue and filled the form!', { duration: 4000 })
  //     } else {
  //       toast('Image uploaded. Please fill in the details.', { icon: '📸' })
  //     }
  //   } catch (err) {
  //     console.error('Analyze error:', err)
  //     // Still show preview, user fills manually
  //     toast('Image saved. Please fill in the details manually.', { icon: '📸' })
  //   } finally {
  //     setAnalyzing(false)
  //   }
  // }, [])

  const handleAIAnalyze = async () => {

    if (!selectedImage) return;

    try {

      setAnalyzing(true);

      const formData = new FormData();

      formData.append("photo", selectedImage);

      const res = await api.post(
        "/analyze/image",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (res.data.analysis) {

        const ai = res.data.analysis;

        setAiResult(ai);

        // Auto-fill form
        setForm(prev => ({
          ...prev,
          title: ai.suggested_title || prev.title,
          description: ai.description || prev.description,
          category: ai.category || prev.category,
        }));

        toast.success(
          "✨ AI detected the issue and filled the form!",
          { duration: 4000 }
        );

      } else {

        toast(
          "Please fill in the details manually.",
          { icon: "📸" }
        );
      }

    } catch (err) {

      console.error("Analyze error:", err);

      toast(
        "AI analysis failed. Please fill manually.",
        { icon: "⚠️" }
      );

    } finally {

      setAnalyzing(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!location) { toast.error('Please pin the issue location on the map'); return }
    if (!form.title.trim()) { toast.error('Please enter a title'); return }

    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('title', form.title)
      formData.append('description', form.description)
      formData.append('category', form.category)
      formData.append('lat', location.lat)
      formData.append('lng', location.lng)
      // Pass the already-uploaded Cloudinary URL
      formData.append("photo", selectedImage);
      // if (photoUrl) formData.append('photoUrl', photoUrl)
      if (aiResult) formData.append('aiAnalysis', JSON.stringify(aiResult))

      const res = await api.post('/issues', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      setSubmitted(true)
      toast.success('Issue reported successfully!')
      setTimeout(() => navigate(`/issues/${res.data.data.id}`), 2000)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit issue')
    } finally {
      setSubmitting(false)
    }
  }

  const removePhoto = () => {
    setPhotoPreview(null)
    setPhotoUrl(null)
    setAiResult(null)
    setForm(prev => ({ ...prev, title: '', description: '', category: 'ROAD' }))
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-950 pt-20 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center space-y-4"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto"
          >
            <CheckCircle2 size={40} className="text-green-400" />
          </motion.div>
          <h2 className="text-2xl font-bold text-white">Issue Reported!</h2>
          <p className="text-gray-400">Redirecting to your issue...</p>
        </motion.div>
      </div>
    )
  }


  return (

    <div className="min-h-screen bg-gray-950 pt-20 pb-12">
      <div className="max-w-2xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-3 py-1 text-blue-400 text-xs font-medium mb-3">
              <Sparkles size={12} />
              AI-Powered Detection
            </div>
            <h1 className="text-3xl font-bold text-white">Report an Issue</h1>
            <p className="text-gray-400 mt-1">Upload a photo — AI will auto-detect and fill the form for you.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Photo Upload */}
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-1.5">
                <Upload size={14} className="text-blue-400" />
                Photo <span className="text-blue-400 text-xs">(AI auto-fills form on upload)</span>
              </label>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                ref={cameraInputRef}
                className="hidden"
                onChange={handleCameraCapture}
              />

              {/* camera button */}
              <button
                type="button"
                onClick={() => cameraInputRef.current.click()}
                className="
                        inline-flex items-center gap-3
                        px-6 py-3
                        rounded-2xl
                        bg-gradient-to-r
                        from-blue-600
                        to-cyan-500
                        text-white
                        font-semibold
                        shadow-lg
                        hover:shadow-blue-500/25
                        hover:scale-105
                        transition-all
                      "
              >
                <div className="p-1 rounded-full bg-white/20">
                  <Camera size={18} />
                </div>
                Take Photo
              </button>

              <AnimatePresence mode="wait">
                {photoPreview ? (
                  <motion.div
                    key="preview"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="relative rounded-xl overflow-hidden"
                  >
                    <img src={photoPreview} alt="Preview" className="w-full h-52 object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />



                    {/* AI analyzing overlay */}
                    {analyzing && (
                      <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-3">
                        <div className="w-10 h-10 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                        <p className="text-white text-sm font-medium">AI analyzing image...</p>
                        <p className="text-gray-400 text-xs">Detecting issue type, severity & category</p>
                      </div>
                    )}

                    {/* AI result badge */}
                    {!analyzing && aiResult && (
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                        <div className="flex items-center gap-2 bg-purple-500/80 backdrop-blur-sm rounded-full px-3 py-1.5">
                          <Wand2 size={12} className="text-white" />
                          <span className="text-white text-xs font-medium">
                            AI detected: {aiResult.issue_type}
                          </span>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full font-bold backdrop-blur-sm ${aiResult.severity === 'critical' ? 'bg-red-500/80 text-white' :
                          aiResult.severity === 'moderate' ? 'bg-orange-500/80 text-white' :
                            'bg-green-500/80 text-white'
                          }`}>
                          {aiResult.severity}
                        </span>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={removePhoto}
                      className="absolute top-2 right-2 w-7 h-7 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-black/80 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="dropzone"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-200 ${isDragActive
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-gray-700 hover:border-blue-500/50 hover:bg-gray-800/30'
                      }`}
                  >
                    <input {...getInputProps()} />
                    <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <Upload size={24} className="text-blue-400" />
                    </div>
                    <p className="text-gray-300 text-sm font-medium mb-1">
                      {isDragActive ? 'Drop photo here' : 'Drag & drop or click to upload'}
                    </p>
                    <p className="text-gray-600 text-xs">AI will auto-detect the issue from your photo</p>
                    <p className="text-gray-700 text-xs mt-1">JPG, PNG, WebP up to 5MB</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* AI filled notice */}
            {aiResult && !analyzing && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-3 bg-purple-500/10 border border-purple-500/20 rounded-xl p-3"
              >
                <Wand2 size={16} className="text-purple-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="text-purple-300 font-medium">Form auto-filled by AI</p>
                  <p className="text-gray-500 text-xs mt-0.5">Review and edit the fields below if needed</p>
                </div>
              </motion.div>
            )}

            <button
              onClick={handleAIAnalyze}
              className="
    mt-4
    inline-flex
    items-center
    gap-2
    rounded-xl
    bg-gradient-to-r
    from-blue-600
    to-indigo-600
    px-5
    py-2.5
    text-sm
    font-semibold
    text-white
    shadow-md
    transition-all
    duration-200
    hover:scale-105
    hover:shadow-lg
    hover:from-blue-700
    hover:to-indigo-700
    active:scale-95
    disabled:cursor-not-allowed
    disabled:opacity-50
  "
            >
              ✨ AI Analysis
            </button>
            {/* Category */}
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Category <span className="text-red-400">*</span>
                {aiResult && <span className="ml-2 text-xs text-purple-400">✨ AI selected</span>}
              </label>
              <div className="grid grid-cols-5 gap-2">
                {CATEGORIES.map(cat => {
                  const cfg = CATEGORY_CONFIG[cat]
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, category: cat }))}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-medium transition-all ${form.category === cat
                        ? 'border-blue-500 bg-blue-500/20 text-blue-400'
                        : 'border-gray-700 bg-gray-800/50 text-gray-400 hover:border-gray-500'
                        }`}
                    >
                      <span className="text-xl">{cfg.icon}</span>
                      <span>{cfg.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                Title <span className="text-red-400">*</span>
                {aiResult?.suggested_title && (
                  <span className="text-xs text-purple-400">✨ AI suggested</span>
                )}
              </label>
              <input
                type="text"
                placeholder="Brief description of the issue"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                className="input-field"
                maxLength={100}
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                Description
                {aiResult?.description && (
                  <span className="text-xs text-purple-400">✨ AI generated</span>
                )}
              </label>
              <textarea
                placeholder="Provide more details about the issue..."
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                className="input-field resize-none"
                rows={3}
              />
            </div>

            {/* City/Zone display — auto from profile */}
            {user?.city && (
              <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-xl p-3">
                <MapPin size={14} className="text-blue-400 flex-shrink-0" />
                <div className="text-sm">
                  <span className="text-gray-400">Routing to: </span>
                  <span className="text-white font-semibold">{user.city.name}</span>
                  <span className="text-gray-500 mx-1">→</span>
                  <span className="text-white font-semibold">{user.zone?.name}</span>
                  <span className="text-gray-500 text-xs ml-2">(from your profile)</span>
                </div>
              </div>
            )}

            {/* Location Picker */}
            <LocationPicker value={location} onChange={setLocation} />

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting || !location || analyzing}
              className="w-full btn-primary py-3 text-base flex items-center justify-center gap-2"
            >
              {submitting ? (
                <><Loader2 size={18} className="animate-spin" /> Submitting...</>
              ) : analyzing ? (
                <><Loader2 size={18} className="animate-spin" /> AI analyzing photo...</>
              ) : (
                <><AlertCircle size={18} /> Submit Issue Report</>
              )}
            </button>

            {!location && (
              <p className="text-center text-xs text-gray-600 flex items-center justify-center gap-1">
                <MapPin size={12} />
                Pin a location on the map to enable submission
              </p>
            )}
          </form>
        </motion.div>
      </div>
    </div>
  )
}
