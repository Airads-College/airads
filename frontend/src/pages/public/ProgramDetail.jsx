import { Head, Link, usePage, router } from "@inertiajs/react";
import {
    Box,
    Container,
    Typography,
    Grid,
    Stack,
    Card,
    CardContent,
    CardMedia,
    Button,
    Chip,
    Rating,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Avatar,
    Divider,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    IconButton,
    Snackbar,
    Alert as MuiAlert,
    useTheme,
} from "@mui/material";
import {
    IconBook,
    IconHeart,
    IconHeartFilled,
    IconShare,
    IconCheck,
    IconPlayerPlay,
    IconLock,
    IconX,
    IconMail,
    IconCreditCard,
} from "@tabler/icons-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { CourseDetailsModal } from "@/components/modals";
import MainNavbar from "@/components/common/MainNavbar";
import VirtualNavbar from "@/components/common/VirtualNavbar";
import AIRADSFooter from "@/components/common/AIRADSFooter";
import { GoogleSignInButton } from "@/features/auth/components/GoogleIdentityScript";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCurrency } from "@/hooks/useCurrency";
import { truncatePlainText } from "@/utils/htmlText";
import { resolvePriceDisplay } from "@/utils/priceDisplay";
import CourseContentTabs from "@/features/programs/components/CourseContentTabs";
import CourseDetailsPanel from "@/features/programs/components/CourseDetailsPanel";

// --- Helper Components ---

const emptyInterestForm = {
    fullName: "",
    email: "",
    phone: "",
};

function EnrollmentInterestModal({
    open,
    onClose,
    program,
    form,
    errors,
    submitting,
    success,
    socialAuth,
    phoneOnly,
    onFieldChange,
    onSubmit,
}) {
    const showGoogle = success && socialAuth?.google?.enabled && success.accountState !== "authenticated";
    const emailActionUrl = success?.emailInboxUrl || success?.loginUrl;
    const opensEmailInbox = Boolean(success?.emailInboxUrl);

    return (
        <Dialog
            open={open}
            onClose={submitting ? undefined : onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: { borderRadius: 2, overflow: "hidden" },
            }}
        >
            {success ? (
                <Box>
                    <DialogTitle sx={{ pr: 6, pb: 1 }}>
                        <Typography variant="h6" fontWeight={800}>
                            {success.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            {success.courseName}
                        </Typography>
                    </DialogTitle>

                    <IconButton
                        aria-label="Close enrollment confirmation"
                        onClick={onClose}
                        sx={{ position: "absolute", top: 10, right: 10 }}
                    >
                        <IconX size={20} />
                    </IconButton>

                    <DialogContent sx={{ pt: 2 }}>
                        <Stack spacing={2.25}>
                            <MuiAlert severity="success" variant="outlined">
                                {success.message}
                            </MuiAlert>

                            <Box>
                                {success.accountState === "authenticated" && (
                                    <Typography variant="body2" color="text.secondary">
                                        {success.accountMessage}
                                    </Typography>
                                )}
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ mt: success.accountState === "authenticated" ? 1 : 0 }}
                                >
                                    Account email: <strong>{success.email}</strong>
                                </Typography>
                            </Box>

                            {showGoogle && (
                                <>
                                    <Box sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
                                        <GoogleSignInButton
                                            clientId={socialAuth.google.clientId}
                                            loginUri={socialAuth.google.loginUrl}
                                            nextUrl={success.googleNextUrl}
                                            context="signin"
                                            text="continue_with"
                                            autoPrompt={false}
                                        />
                                    </Box>
                                    <Divider>
                                        <Typography variant="caption" color="text.secondary">
                                            or continue with email
                                        </Typography>
                                    </Divider>
                                </>
                            )}

                            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                                {success.accountState !== "authenticated" && (
                                    <Stack spacing={1.25} sx={{ width: "100%" }}>
                                        <Typography variant="body2" color="text.secondary" align="center">
                                            Use the sign-in details sent to <strong>{success.email}</strong>.
                                        </Typography>
                                        <Button
                                            component={opensEmailInbox ? "a" : Link}
                                            href={emailActionUrl}
                                            target={opensEmailInbox ? "_blank" : undefined}
                                            rel={opensEmailInbox ? "noopener noreferrer" : undefined}
                                            variant="outlined"
                                            startIcon={<IconMail size={18} />}
                                            fullWidth
                                        >
                                            Use email
                                        </Button>
                                    </Stack>
                                )}
                                {success.accountState === "authenticated" && success.checkoutUrl && (
                                    <Button
                                        component={Link}
                                        href={success.checkoutUrl}
                                        variant="contained"
                                        startIcon={<IconCreditCard size={18} />}
                                        fullWidth
                                    >
                                        Complete payment
                                    </Button>
                                )}
                                {success.accountState === "authenticated" && success.courseUrl && (
                                    <Button
                                        component={Link}
                                        href={success.courseUrl}
                                        variant="contained"
                                        startIcon={<IconPlayerPlay size={18} />}
                                        fullWidth
                                    >
                                        Open course
                                    </Button>
                                )}
                            </Stack>
                        </Stack>
                    </DialogContent>
                </Box>
            ) : (
            <Box component="form" noValidate onSubmit={onSubmit}>
                <DialogTitle sx={{ pr: 6, pb: 1 }}>
                    <Typography variant="h6" fontWeight={800}>
                        {phoneOnly ? "Add your phone number" : "Enroll now"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        {program?.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {phoneOnly
                            ? "We need a phone number so admissions can call if you need help."
                            : "We save your details first so admissions can call if you need help."}
                    </Typography>
                </DialogTitle>

                <IconButton
                    aria-label="Close enrollment form"
                    onClick={onClose}
                    disabled={submitting}
                    sx={{ position: "absolute", top: 10, right: 10 }}
                >
                    <IconX size={20} />
                </IconButton>

                <DialogContent sx={{ pt: 2 }}>
                    <Stack spacing={2.25}>
                        {!phoneOnly && (
                            <>
                                <TextField
                                    label="Full name"
                                    name="fullName"
                                    value={form.fullName}
                                    onChange={(event) => onFieldChange("fullName", event.target.value)}
                                    placeholder="e.g. Mary Wanjiku"
                                    autoComplete="name"
                                    required
                                    fullWidth
                                    error={!!errors.fullName}
                                    helperText={errors.fullName}
                                />
                                <TextField
                                    label="Email address"
                                    name="email"
                                    type="email"
                                    value={form.email}
                                    onChange={(event) => onFieldChange("email", event.target.value)}
                                    placeholder="mary@example.com"
                                    autoComplete="email"
                                    required
                                    fullWidth
                                    error={!!errors.email}
                                    helperText={errors.email}
                                />
                            </>
                        )}
                        <TextField
                            label="Phone number"
                            name="phone"
                            type="tel"
                            value={form.phone}
                            onChange={(event) => onFieldChange("phone", event.target.value)}
                            placeholder="0715 000 111"
                            autoComplete="tel"
                            required
                            fullWidth
                            error={!!errors.phone}
                            helperText={errors.phone}
                        />
                    </Stack>
                </DialogContent>

                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button onClick={onClose} disabled={submitting} color="inherit">
                        Cancel
                    </Button>
                    <Button type="submit" variant="contained" disabled={submitting}>
                        {submitting ? "Saving..." : "Continue"}
                    </Button>
                </DialogActions>
            </Box>
            )}
        </Dialog>
    );
}

// Course Details Sidebar with Context-Aware CTAs
function CourseDetailsSidebar({
    program,
    enrollmentStatus,
    enrollmentData,
    ctaState,
    prerequisiteStatus,
    isAuthenticated,
    onShowDetails,
    onOpenEnrollmentInterest,
    onToggleWishlist,
    wishlisted,
    isPreview = false,
}) {
    const theme = useTheme();
    const { formatCurrency } = useCurrency();
    const isEnrolled = enrollmentStatus === "enrolled";
    const isCompleted = enrollmentData?.isCompleted;
    const progressPercent = enrollmentData?.progressPercent || 0;
    const ctaText = "ENROLL NOW";
    const priceDisplay = resolvePriceDisplay(program);

    return (
        <Card sx={{ mb: 3, position: "sticky", top: 100 }}>
            <CardContent sx={{ p: 3 }}>
                {!isEnrolled && !priceDisplay.isHidden && (
                    <Box sx={{ mb: 2 }}>
                        <Stack direction="row" spacing={1} alignItems="baseline">
                            <Typography variant="h5" fontWeight={800}>
                                {priceDisplay.showPrice
                                    ? formatCurrency(priceDisplay.price)
                                    : "Free"}
                            </Typography>
                            {priceDisplay.hasDiscount && (
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ textDecoration: "line-through" }}
                                >
                                    {formatCurrency(priceDisplay.originalPrice)}
                                </Typography>
                            )}
                        </Stack>
                        {priceDisplay.priceInfo && (
                            <Typography variant="caption" color="text.secondary">
                                {priceDisplay.priceInfo}
                            </Typography>
                        )}
                    </Box>
                )}
                {/* Enrolled User CTA */}
                {!isPreview && (isEnrolled ? (
                    <>
                        {/* Completion/Progress Badge */}
                        <Stack
                            direction="row"
                            sx={{
                                mb: 2,
                                p: 1.5,
                                alignItems: "center",
                                justifyContent: "space-between",
                                bgcolor: isCompleted
                                    ? "success.light"
                                    : "primary.light",
                                borderRadius: 2,
                            }}
                        >
                            <Stack
                                direction="row"
                                spacing={1}
                                sx={{ alignItems: "center" }}
                            >
                                <IconCheck
                                    size={20}
                                    color={
                                        isCompleted
                                            ? theme.palette.success.main
                                            : theme.palette.primary.main
                                    }
                                />
                                <Box>
                                    <Typography
                                        variant="body2"
                                        fontWeight={600}
                                    >
                                        {isCompleted
                                            ? "Course complete"
                                            : "In progress"}
                                    </Typography>
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                    >
                                        Score: {progressPercent}%
                                    </Typography>
                                </Box>
                            </Stack>
                            <Button
                                size="small"
                                variant="contained"
                                onClick={onShowDetails}
                                sx={{
                                    bgcolor: theme.palette.primary.main,
                                    fontSize: "0.7rem",
                                    px: 1.5,
                                }}
                            >
                                Details
                            </Button>
                        </Stack>

                        {/* Continue Button */}
                        <Button
                            component={Link}
                            href={`/student/programs/${program.id}/resume/`}
                            variant="contained"
                            fullWidth
                            size="large"
                            sx={{
                                mb: 2,
                                py: 1.5,
                                fontWeight: 700,
                                bgcolor: theme.palette.primary.main,
                            }}
                        >
                            CONTINUE STUDYING
                        </Button>

                        {/* Quick Actions for enrolled */}
                        <Stack
                            direction="row"
                            spacing={2}
                            sx={{ mb: 3, justifyContent: "center" }}
                        >
                            <Button
                                startIcon={
                                    wishlisted ? (
                                        <IconHeartFilled
                                            size={18}
                                            color={theme.palette.error.main}
                                        />
                                    ) : (
                                        <IconHeart size={18} />
                                    )
                                }
                                size="small"
                                color="inherit"
                                onClick={() =>
                                    onToggleWishlist && onToggleWishlist(program.id)
                                }
                            >
                                {wishlisted
                                    ? "Remove from wishlist"
                                    : "Add to wishlist"}
                            </Button>
                            <Button
                                startIcon={<IconShare size={18} />}
                                size="small"
                                color="inherit"
                            >
                                Share
                            </Button>
                        </Stack>
                    </>
                ) : ctaState === "prerequisites_required" ? (
                    <>
                        <MuiAlert
                            severity="warning"
                            icon={<IconLock size={18} />}
                            sx={{ mb: 2 }}
                        >
                            <Typography variant="body2" fontWeight={700}>
                                Prerequisites required
                            </Typography>
                            <Typography variant="caption" component="div">
                                {prerequisiteStatus?.blockingMessage ||
                                    "Complete the required courses first."}
                            </Typography>
                        </MuiAlert>
                        <Button
                            variant="outlined"
                            fullWidth
                            size="large"
                            disabled
                            sx={{ mb: 2, py: 1.5 }}
                        >
                            PREREQUISITES REQUIRED
                        </Button>
                        <List dense disablePadding sx={{ mb: 2 }}>
                            {(prerequisiteStatus?.requirements || []).map(
                                (item) => (
                                    <ListItem key={item.programId} disableGutters>
                                        <ListItemIcon sx={{ minWidth: 30 }}>
                                            {item.passed ? (
                                                <IconCheck size={18} />
                                            ) : (
                                                <IconLock size={18} />
                                            )}
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={item.name}
                                            secondary={
                                                item.score == null
                                                    ? "No published score yet"
                                                    : `Score: ${item.score}%`
                                            }
                                        />
                                    </ListItem>
                                ),
                            )}
                        </List>
                    </>
                ) : ctaState === "pending_payment" ? (
                    <>
                        <Button
                            component={Link}
                            href="/student/orders/"
                            variant="outlined"
                            fullWidth
                            size="large"
                            sx={{ mb: 2, py: 1.5 }}
                        >
                            COMPLETE PAYMENT
                        </Button>
                    </>
                ) : enrollmentStatus === "pending" ? (
                    <>
                        <Button
                            variant="outlined"
                            fullWidth
                            size="large"
                            disabled
                            sx={{ mb: 2, py: 1.5 }}
                        >
                            ENROLLMENT PENDING
                        </Button>
                        <Stack
                            direction="row"
                            spacing={2}
                            sx={{ mb: 3, justifyContent: "center" }}
                        >
                            <Button
                                startIcon={<IconHeart size={18} />}
                                size="small"
                                color="inherit"
                            >
                                Add to wishlist
                            </Button>
                            <Button
                                startIcon={<IconShare size={18} />}
                                size="small"
                                color="inherit"
                            >
                                Share
                            </Button>
                        </Stack>
                    </>
                ) : isAuthenticated ? (
                    <>
                        {ctaState === "not_enrolled_paid" ? (
                            <>
                                <Button
                                    variant="contained"
                                    fullWidth
                                    size="large"
                                    onClick={() =>
                                        onOpenEnrollmentInterest &&
                                        onOpenEnrollmentInterest()
                                    }
                                    sx={{
                                        mb: 1.5,
                                        py: 1.5,
                                        fontWeight: 700,
                                        bgcolor: theme.palette.primary.main,
                                    }}
                                >
                                    {ctaText}
                                </Button>
                                {/* Add to Cart hidden for now
                                <Button
                                    variant="outlined"
                                    fullWidth
                                    size="large"
                                    startIcon={<IconShoppingCart size={18} />}
                                    onClick={() =>
                                        onAddToCart && onAddToCart(program.id)
                                    }
                                    sx={{
                                        mb: 2,
                                        py: 1.5,
                                        fontWeight: 700,
                                    }}
                                >
                                    Add to Cart
                                </Button>
                                */}
                            </>
                        ) : (
                            <Button
                                variant="contained"
                                fullWidth
                                size="large"
                                onClick={() =>
                                    onOpenEnrollmentInterest &&
                                    onOpenEnrollmentInterest()
                                }
                                sx={{
                                    mb: 2,
                                    py: 1.5,
                                    fontWeight: 700,
                                    bgcolor: theme.palette.primary.main,
                                }}
                            >
                                {ctaText}
                            </Button>
                        )}
                        <Stack
                            direction="row"
                            spacing={2}
                            sx={{ mb: 3, justifyContent: "center" }}
                        >
                            <Button
                                startIcon={
                                    wishlisted ? (
                                        <IconHeartFilled size={18} color={theme.palette.error.main} />
                                    ) : (
                                        <IconHeart size={18} />
                                    )
                                }
                                size="small"
                                color="inherit"
                                onClick={() => onToggleWishlist && onToggleWishlist(program.id)}
                            >
                                {wishlisted ? "Remove from wishlist" : "Add to wishlist"}
                            </Button>
                            <Button
                                startIcon={<IconShare size={18} />}
                                size="small"
                                color="inherit"
                            >
                                Share
                            </Button>
                        </Stack>
                    </>
                ) : (
                    <>
                        <Button
                            variant="contained"
                            fullWidth
                            size="large"
                            onClick={() =>
                                onOpenEnrollmentInterest &&
                                onOpenEnrollmentInterest()
                            }
                            sx={{
                                mb: 2,
                                py: 1.5,
                                fontWeight: 700,
                                bgcolor: theme.palette.primary.main,
                            }}
                        >
                            {ctaText}
                        </Button>
                        <Stack
                            direction="row"
                            spacing={2}
                            sx={{ mb: 3, justifyContent: "center" }}
                        >
                            <Button
                                startIcon={
                                    wishlisted ? (
                                        <IconHeartFilled size={18} color={theme.palette.error.main} />
                                    ) : (
                                        <IconHeart size={18} />
                                    )
                                }
                                size="small"
                                color="inherit"
                                onClick={() => onToggleWishlist && onToggleWishlist(program.id)}
                            >
                                {wishlisted ? "Remove from wishlist" : "Add to wishlist"}
                            </Button>
                            <Button
                                startIcon={<IconShare size={18} />}
                                size="small"
                                color="inherit"
                            >
                                Share
                            </Button>
                        </Stack>
                    </>
                ))}

                <CourseDetailsPanel program={program} />
            </CardContent>
        </Card>
    );
}

// Popular Courses Sidebar
function PopularCourses({ courses }) {
    const { formatCurrency } = useCurrency();

    if (!courses || courses.length === 0) return null;

    const getPriceLabel = (course) => {
        const priceDisplay = resolvePriceDisplay(course);
        if (priceDisplay.showPrice) {
            return formatCurrency(priceDisplay.price);
        }
        return priceDisplay.showFree ? "Free" : "";
    };

    return (
        <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                Popular courses
            </Typography>
            <Stack spacing={2}>
                {courses.map((course) => (
                    <Card
                        key={course.id}
                        component={Link}
                        href={course.publicUrl}
                        sx={{
                            textDecoration: "none",
                            display: "flex",
                            "&:hover": { boxShadow: 3 },
                        }}
                    >
                        <CardMedia
                            component="img" loading="lazy"
                            sx={{ width: 80, height: 60, objectFit: "cover" }}
                            image={
                                course.thumbnail ||
                                "/static/images/course-placeholder.svg"
                            }
                            alt={course.name}
                        />
                        <CardContent sx={{ p: 1.5, flex: 1 }}>
                            <Typography variant="body2" fontWeight={600} noWrap>
                                {course.name}
                            </Typography>
                            <Typography
                                variant="caption"
                                color="text.secondary"
                            >
                                {getPriceLabel(course)}
                            </Typography>
                        </CardContent>
                    </Card>
                ))}
            </Stack>
        </Box>
    );
}


export default function ProgramDetail({
    program,
    curriculum = [],
    instructors = [],
    popularPrograms = [],
    enrollmentStatus,
    enrollmentData,
    ctaState = "not_enrolled",
    prerequisiteStatus = null,
    isPreview = false,
    builderUrl = null,
    socialAuth = {},
    programInterestSuccess = null,
}) {
    const { auth, platform, siteContext = {} } = usePage().props;
    const { addToCart } = useCart();
    const { wishlist, addToWishlist, removeFromWishlist } = useWishlist();
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [interestModalOpen, setInterestModalOpen] = useState(false);
    const [interestForm, setInterestForm] = useState(emptyInterestForm);
    const [interestErrors, setInterestErrors] = useState({});
    const [interestSubmitting, setInterestSubmitting] = useState(false);
    const [interestSuccess, setInterestSuccess] = useState(programInterestSuccess);
    const [cartSnackbar, setCartSnackbar] = useState({ open: false, message: "", severity: "success" });
    const isVirtualCampus = !!siteContext?.isVirtualCampus;
    const shortDescription = truncatePlainText(program.description, 200);
    const phoneOnlyInterest = !!auth?.user && !auth.user.phone;

    useEffect(() => {
        if (programInterestSuccess) {
            setInterestSuccess(programInterestSuccess);
            setInterestModalOpen(true);
        }
    }, [programInterestSuccess]);

    const handleShowDetails = () => setDetailsModalOpen(true);
    const handleCloseDetails = () => setDetailsModalOpen(false);

    const isWishlisted = (wishlist?.items || []).some((item) => item.program?.id === program.id);

    const getDefaultInterestForm = () => ({
        fullName: auth?.user?.fullName || auth?.user?.name || "",
        email: auth?.user?.email || "",
        phone: auth?.user?.phone || "",
    });

    const handleOpenEnrollmentInterest = () => {
        const defaults = getDefaultInterestForm();
        setInterestSuccess(null);
        setInterestForm(defaults);
        setInterestErrors({});
        if (auth?.user && defaults.phone) {
            setCartSnackbar({
                open: true,
                message: "Preparing your enrollment...",
                severity: "info",
            });
            submitEnrollmentInterest(defaults);
            return;
        }
        setInterestModalOpen(true);
    };

    const handleCloseEnrollmentInterest = () => {
        if (interestSubmitting) return;
        setInterestModalOpen(false);
        setInterestSuccess(null);
    };

    const handleInterestFieldChange = (field, value) => {
        setInterestForm((current) => ({ ...current, [field]: value }));
        setInterestErrors((current) => {
            if (!current[field]) return current;
            const next = { ...current };
            delete next[field];
            return next;
        });
    };

    const validateInterestForm = () => {
        const nextErrors = {};
        const email = interestForm.email.trim();

        if (!interestForm.fullName.trim()) {
            nextErrors.fullName = "Full name is required.";
        }
        if (!email) {
            nextErrors.email = "Email address is required.";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            nextErrors.email = "Enter a valid email address.";
        }
        if (!interestForm.phone.trim()) {
            nextErrors.phone = "Phone number is required.";
        }

        setInterestErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    function submitEnrollmentInterest(formValues) {
        router.post(`/programs/${program.id}/interest/`, {
            fullName: formValues.fullName.trim(),
            email: formValues.email.trim(),
            phone: formValues.phone.trim(),
        }, {
            preserveScroll: true,
            onStart: () => setInterestSubmitting(true),
            onSuccess: (page) => {
                const successPayload = page?.props?.programInterestSuccess;
                if (successPayload) {
                    setInterestSuccess(successPayload);
                    setInterestModalOpen(true);
                } else {
                    setInterestModalOpen(false);
                }
            },
            onError: (errors) => {
                setInterestErrors(errors || {});
                setCartSnackbar({
                    open: true,
                    message: "Could not submit your details. Please check the form.",
                    severity: "error",
                });
            },
            onFinish: () => setInterestSubmitting(false),
        });
    }

    const handleSubmitEnrollmentInterest = (event) => {
        event.preventDefault();
        if (!validateInterestForm()) return;
        submitEnrollmentInterest(interestForm);
    };

    const handleAddToCart = async (programId) => {
        const res = await addToCart(programId);
        if (res.ok) {
            setCartSnackbar({ open: true, message: "Added to cart.", severity: "success" });
            return;
        }
        if (res.error === "program_in_cart") {
            setCartSnackbar({ open: true, message: "Program is already in your cart.", severity: "info" });
            return;
        }
        setCartSnackbar({ open: true, message: res.message || "Could not add to cart.", severity: "error" });
    };

    const handleToggleWishlist = async (programId) => {
        if (isWishlisted) {
            const res = await removeFromWishlist(programId);
            if (!res.ok) {
                setCartSnackbar({ open: true, message: res.message || "Could not update wishlist.", severity: "error" });
            }
            return;
        }
        const res = await addToWishlist(programId);
        if (!res.ok) {
            setCartSnackbar({ open: true, message: res.message || "Could not update wishlist.", severity: "error" });
        }
    };

    return (
        <>
            <Head title={`${program.name} - ${platform?.institutionName || "DigikaTech Africa"}`} />

            <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
                {/* Navbar */}
                {isVirtualCampus ? <VirtualNavbar /> : <MainNavbar />}

                {isPreview && (
                    <Box
                        sx={{
                            position: "relative",
                            zIndex: 2,
                            bgcolor: "warning.light",
                            borderBottom: 1,
                            borderColor: "warning.main",
                            pt: 9,
                            pb: 1,
                        }}
                    >
                        <Container maxWidth="lg">
                            <Stack
                                direction={{ xs: "column", sm: "row" }}
                                spacing={1}
                                sx={{
                                    alignItems: { xs: "stretch", sm: "center" },
                                    justifyContent: "space-between",
                                }}
                            >
                                <Typography variant="body2" fontWeight={700}>
                                    Draft preview. This course is not visible to students.
                                </Typography>
                                {builderUrl && (
                                    <Button
                                        component={Link}
                                        href={builderUrl}
                                        variant="outlined"
                                        color="inherit"
                                        size="small"
                                    >
                                        Back to Course Builder
                                    </Button>
                                )}
                            </Stack>
                        </Container>
                    </Box>
                )}

                {/* Badge (if any) */}
                <Container maxWidth="lg" sx={{ pt: isPreview ? 3 : 12 }}>
                    {program.badge_type && (
                        <Chip
                            label={program.badge_type.toUpperCase()}
                            size="small"
                            sx={{
                                mb: 2,
                                bgcolor:
                                    program.badge_type === "hot"
                                        ? "error.main"
                                        : program.badge_type === "new"
                                          ? "success.main"
                                          : "warning.main",
                                color: "white",
                                fontWeight: 700,
                            }}
                        />
                    )}
                </Container>

                {/* Main Content */}
                <Container maxWidth="lg" sx={{ pb: 8 }}>
                    <Grid container spacing={4}>
                        {/* Left Sidebar */}
                        <Grid size={{ xs: 12, md: 4 }} order={{ xs: 2, md: 1 }}>
                            <CourseDetailsSidebar
                                program={program}
                                enrollmentStatus={enrollmentStatus}
                                enrollmentData={enrollmentData}
                                ctaState={ctaState}
                                prerequisiteStatus={prerequisiteStatus}
                                isAuthenticated={!!auth?.user}
                                onShowDetails={handleShowDetails}
                                onOpenEnrollmentInterest={handleOpenEnrollmentInterest}
                                onAddToCart={handleAddToCart}
                                onToggleWishlist={handleToggleWishlist}
                                wishlisted={isWishlisted}
                                isPreview={isPreview}
                            />
                            <PopularCourses courses={popularPrograms} />
                        </Grid>

                        {/* Main Content Area */}
                        <Grid size={{ xs: 12, md: 8 }} order={{ xs: 1, md: 2 }}>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                {/* Category & Instructor Row */}
                                <Stack
                                    direction="row"
                                    spacing={3}
                                    sx={{ mb: 2, alignItems: "center", flexWrap: "wrap" }}
                                >
                                    <Stack
                                        direction="row"
                                        spacing={1}
                                        sx={{ alignItems: "center" }}
                                    >
                                        <IconBook size={18} />
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                        >
                                            Category
                                        </Typography>
                                        <Chip
                                            label={
                                                program.category || "General"
                                            }
                                            size="small"
                                            variant="outlined"
                                        />
                                    </Stack>

                                    {instructors.length > 0 && (
                                        <Stack
                                            direction="row"
                                            spacing={1}
                                            sx={{ alignItems: "center" }}
                                        >
                                            <Avatar
                                                sx={{
                                                    width: 24,
                                                    height: 24,
                                                    fontSize: 12,
                                                }}
                                            >
                                                {instructors[0].name.charAt(0)}
                                            </Avatar>
                                            <Typography variant="body2">
                                                <strong>Instructor</strong>{" "}
                                                {instructors[0].name}
                                            </Typography>
                                        </Stack>
                                    )}

                                    <Stack
                                        direction="row"
                                        spacing={0.5}
                                        sx={{ alignItems: "center" }}
                                    >
                                        <Rating
                                            value={program.rating || 0}
                                            precision={0.1}
                                            size="small"
                                            readOnly
                                        />
                                        <Typography
                                            variant="body2"
                                            fontWeight={600}
                                        >
                                            {program.rating?.toFixed(1)}
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                        >
                                            ({program.review_count} reviews)
                                        </Typography>
                                    </Stack>
                                </Stack>

                                {/* Title */}
                                <Typography
                                    variant="h4"
                                    fontWeight={700}
                                    sx={{ mb: 2 }}
                                >
                                    {program.name}
                                </Typography>

                                {/* Short Description */}
                                <Typography
                                    variant="body1"
                                    color="text.secondary"
                                    sx={{ mb: 3 }}
                                >
                                    {shortDescription}
                                </Typography>

                                {/* Featured Image */}
                                {program.thumbnail && (
                                    <Box
                                        component="img" loading="lazy"
                                        src={program.thumbnail}
                                        alt={program.name}
                                        sx={{
                                            width: "100%",
                                            height: 350,
                                            objectFit: "cover",
                                            borderRadius: 2,
                                            mb: 3,
                                        }}
                                    />
                                )}

                                <CourseContentTabs
                                    program={program}
                                    curriculum={curriculum}
                                />
                            </motion.div>
                        </Grid>
                    </Grid>
                </Container>

                {/* Footer */}
                <AIRADSFooter />
            </Box>

            {/* Modals */}
            <EnrollmentInterestModal
                open={interestModalOpen}
                onClose={handleCloseEnrollmentInterest}
                program={program}
                form={interestForm}
                errors={interestErrors}
                submitting={interestSubmitting}
                success={interestSuccess}
                socialAuth={socialAuth}
                phoneOnly={phoneOnlyInterest}
                onFieldChange={handleInterestFieldChange}
                onSubmit={handleSubmitEnrollmentInterest}
            />

            <CourseDetailsModal
                open={detailsModalOpen}
                onClose={handleCloseDetails}
                program={program}
                enrollmentData={enrollmentData}
            />
            {/* Cart Snackbar */}
            <Snackbar
                open={cartSnackbar.open}
                autoHideDuration={4000}
                onClose={() => setCartSnackbar((s) => ({ ...s, open: false }))}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <MuiAlert
                    severity={cartSnackbar.severity}
                    onClose={() => setCartSnackbar((s) => ({ ...s, open: false }))}
                    variant="filled"
                    sx={{ width: "100%" }}
                >
                    {cartSnackbar.message}
                </MuiAlert>
            </Snackbar>
        </>
    );
}
