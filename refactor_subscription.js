const fs = require('fs');
const path = '/home/ahmed/nextjs-project/CERP-Website/src/app/[locale]/admin/subscription/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add Icons
content = content.replace(
  'Inbox } from "lucide-react";',
  'Inbox, ChevronLeft, ChevronRight } from "lucide-react";'
);

// 2. Add viewMode state and replace showModal
content = content.replace(
  'const [showModal, setShowModal] = useState(false);',
  'const [viewMode, setViewMode] = useState<\'LIST\' | \'FORM\'>(\'LIST\');'
);

// 3. Update handleShowDetails and handleEdit
const oldHandlers = `    const handleShowDetails = (item: SubscriptionDTO) => {
        setSelectedSubscription(item);
        setIsEditing(false);
        setShowModal(true);
    };

    const handleEdit = (item: SubscriptionDTO) => {
        setSelectedSubscription(item);
        setFormData(item);
        setIsEditing(true);
        setShowModal(true);
    };`;

const newHandlers = `    const handleShowDetails = (item: SubscriptionDTO) => {
        setSelectedSubscription(item);
        setIsEditing(false);
        setViewMode('FORM');
    };

    const handleEdit = (item: SubscriptionDTO) => {
        setSelectedSubscription(item);
        setFormData(item);
        setIsEditing(true);
        setViewMode('FORM');
    };

    const currentIndex = selectedSubscription ? filteredSubscriptions.findIndex((s: any) => s.id === selectedSubscription.id) : -1;
    const hasPrev = currentIndex > 0;
    const hasNext = currentIndex !== -1 && currentIndex < filteredSubscriptions.length - 1;

    const handlePrev = () => {
        if (hasPrev) {
            const prev = filteredSubscriptions[currentIndex - 1];
            setSelectedSubscription(prev);
            setFormData(prev);
        }
    };

    const handleNext = () => {
        if (hasNext) {
            const next = filteredSubscriptions[currentIndex + 1];
            setSelectedSubscription(next);
            setFormData(next);
        }
    };`;

content = content.replace(oldHandlers, newHandlers);

// 4. Update handleCloseModal
content = content.replace(
  'setShowModal(false);',
  'setViewMode(\'LIST\');'
);

// 5. Wrap the LIST view content
// The LIST view starts right after the "return (" for the non-admin check
const listStart = `    return (

        <section className="container mx-auto p-4 lg:p-8" dir={dir}>`;

const listReplacement = `    return (

        <section className="container mx-auto p-4 lg:p-8" dir={dir}>
            {viewMode === 'LIST' ? (
                <>`;

content = content.replace(listStart, listReplacement);

// 6. Wrap the Modal into FORM View
const modalStart = `            {
                showModal && selectedSubscription && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                        <div
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                            onClick={handleCloseModal}
                        />
                        <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-5xl relative z-10 animate-in fade-in zoom-in duration-200 overflow-hidden flex flex-col max-h-[90vh]">
                            <div className="flex items-center justify-between p-8 border-b border-gray-50 bg-white shrink-0 z-20">`;

const formStart = `            </>
            ) : viewMode === 'FORM' && selectedSubscription ? (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Form Header with Breadcrumbs & Pagination */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={handleCloseModal} 
                                className="text-gray-500 hover:text-primary font-bold transition-colors text-lg"
                            >
                                {t('title')}
                            </button>
                            <span className="text-gray-300 mx-2">/</span>
                            <span className="text-gray-900 font-black tracking-tight text-lg">#{selectedSubscription.id} - {(selectedSubscription as any).user?.charityName || selectedSubscription.fullName}</span>
                        </div>

                        <div className="flex items-center gap-2 bg-white rounded-2xl border border-gray-100 p-1.5 shadow-sm">
                            <button 
                                onClick={handlePrev} 
                                disabled={!hasPrev} 
                                className="p-2 text-gray-500 hover:text-primary hover:bg-primary/5 rounded-xl disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                            >
                                {isAr ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                            </button>
                            <span className="px-4 text-sm font-bold text-gray-600 border-x border-gray-100">
                                {currentIndex + 1} / {filteredSubscriptions.length}
                            </span>
                            <button 
                                onClick={handleNext} 
                                disabled={!hasNext} 
                                className="p-2 text-gray-500 hover:text-primary hover:bg-primary/5 rounded-xl disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                            >
                                {isAr ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 w-full relative z-10 overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between p-8 border-b border-gray-50 bg-white shrink-0 z-20">`;

content = content.replace(modalStart, formStart);

// 7. Remove the closing tags of the Modal
// The end of the Modal is:
//                 )
//             }
//             {
//                 showDeleteModal && (
const modalEnd = `                            </div>
                        </div>
                    </div>
                )
            }
            {
                showDeleteModal && (`;

const formEnd = `                            </div>
                        </div>
                    </div>
                </div>
            ) : null}
            {
                showDeleteModal && (`;

content = content.replace(modalEnd, formEnd);

fs.writeFileSync(path, content, 'utf8');
console.log('Refactoring complete.');
