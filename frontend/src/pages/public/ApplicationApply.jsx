import { Head, useForm, usePage } from "@inertiajs/react";
import {
  Alert,
  Box,
  Button,
  Container,
  Divider,
  Grid,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  Email,
  MenuBook,
  Person,
  Send,
} from "@mui/icons-material";
import { usePublicBrand } from "../../hooks/usePublicBrand";
import AiradsLogoLockup from "../../components/common/AiradsLogoLockup";
import { getFlashMessages } from "../../utils/userMessages";

const KCSE_GRADES = [
  "A",
  "A-",
  "B+",
  "B",
  "B-",
  "C+",
  "C",
  "C-",
  "D+",
  "D",
  "D-",
  "E",
];

/* ── Section header inside the form ────────────────────────── */
function FormSectionHeader({ icon, title, brand }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.5 }}>
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: 2,
          bgcolor: brand.softBlue,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: brand.primary,
        }}
      >
        {icon}
      </Box>
      <Typography variant="h6" sx={{ fontWeight: 800, color: brand.neutralText }}>
        {title}
      </Typography>
    </Box>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════════ */
export default function ApplicationApply({
  campuses = [],
  programmes = [],
  educationLevels = [],
  intakes = [],
  applicationContext = {},
}) {
  const brand = usePublicBrand();
  const { props } = usePage();
  const flashMessages = getFlashMessages(props.flash);
  const successMessage = flashMessages.find((message) => message.type === "success")?.message;
  const errorMessage = flashMessages.find((message) => message.type === "error")?.message;
  const isVirtual = applicationContext?.isVirtual;
  const defaultCampus = isVirtual ? campuses[0] : null;
  const notSureCourse = "Not Sure Yet";

  const { data, setData, post, processing, reset, wasSuccessful } = useForm({
    fullName: "",
    phone: "",
    email: "",
    campusId: defaultCampus?.id || "",
    programId: "",
    preferredCampus: defaultCampus?.name || "",
    preferredProgramme: "",
    intake: intakes[0] || "",
    educationLevel: "",
    educationResult: "",
    studyMode: applicationContext?.studyMode || "on_campus",
    message: "",
    source: applicationContext?.source || "main_website",
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    post(applicationContext?.submitUrl || "/admissions/apply/submit/", {
      preserveScroll: true,
      onSuccess: () => reset(),
    });
  };

  const centeredLogo = (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <AiradsLogoLockup
        href="/"
        crestHeight={{ xs: 64, sm: 78 }}
        headlineFontSize={{ xs: "1rem", sm: "1.25rem" }}
        subheadFontSize={{ xs: "0.72rem", sm: "0.86rem" }}
        taglineFontSize={{ xs: "0.52rem", sm: "0.6rem" }}
        sx={{ mx: "auto", justifyContent: "center" }}
      />
    </Box>
  );

  /* ── Shared form card ─────────────────────────────────────── */
  const applicationForm = (
    <Paper
      component="form"
      onSubmit={handleSubmit}
      elevation={0}
      sx={{
        width: "100%",
        p: { xs: 3, md: 5 },
        borderRadius: 4,
        border: "1px solid",
        borderColor: "grey.200",
        boxShadow: "0 25px 50px -12px rgba(0,0,0,0.08), 0 10px 20px -5px rgba(0,0,0,0.04)",
        position: "relative",
        overflow: "hidden",
        bgcolor: "white",
      }}
    >
      <Stack spacing={4}>
        <Box sx={{ textAlign: "center" }}>
          <Typography
            variant="h4"
            component="h1"
            sx={{ fontWeight: 900, color: brand.secondary }}
          >
            Apply Now
          </Typography>
          <Typography variant="body2" sx={{ color: brand.mutedText, mt: 0.5 }}>
            Share your details and our admissions team will contact you.
          </Typography>
        </Box>

        {/* Alerts */}
        {successMessage && (
          <Alert severity="success" sx={{ borderRadius: 2 }}>
            {successMessage}
          </Alert>
        )}
        {errorMessage && (
          <Alert severity="error" sx={{ borderRadius: 2 }}>
            {errorMessage}
          </Alert>
        )}
        {wasSuccessful && !successMessage && (
          <Alert severity="success" sx={{ borderRadius: 2 }}>
            Your application has been received. Our admissions team will contact you soon.
          </Alert>
        )}

        {/* Section: Personal Info */}
        <Box>
          <FormSectionHeader icon={<Person fontSize="small" />} title="Personal Information" brand={brand} />
          <Typography variant="body2" sx={{ color: brand.mutedText, ml: 7, mb: 2 }}>
            We&apos;ll use this to contact you about your application.
          </Typography>
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Full name"
                value={data.fullName}
                onChange={(event) => setData("fullName", event.target.value)}
                required
                fullWidth
                variant="outlined"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Phone number"
                value={data.phone}
                onChange={(event) => setData("phone", event.target.value)}
                required
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Email address"
                type="email"
                value={data.email}
                onChange={(event) => setData("email", event.target.value)}
                fullWidth
              />
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ borderStyle: "dashed" }} />

        {/* Section: Course Preferences */}
        <Box>
          <FormSectionHeader icon={<MenuBook fontSize="small" />} title="Course Preferences" brand={brand} />
          <Typography variant="body2" sx={{ color: brand.mutedText, ml: 7, mb: 2 }}>
            Tell us which course you&apos;d like to study.
          </Typography>
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, sm: 6 }}>
              {isVirtual ? (
                <TextField
                  label="Campus"
                  value={applicationContext?.lockedCampus || "Virtual Campus"}
                  fullWidth
                  disabled
                />
              ) : (
                <TextField
                  select
                  label="Preferred campus"
                  value={data.campusId}
                  onChange={(event) => {
                    const selectedCampus = campuses.find((campus) => String(campus.id) === String(event.target.value));
                    setData({
                      ...data,
                      campusId: event.target.value,
                      preferredCampus: selectedCampus?.name || "",
                    });
                  }}
                  required
                  fullWidth
                >
                  {campuses.map((campus) => (
                    <MenuItem key={campus.id} value={campus.id}>
                      {campus.name}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                label="Preferred intake"
                value={data.intake}
                onChange={(event) => setData("intake", event.target.value)}
                fullWidth
              >
                {intakes.map((intake) => (
                  <MenuItem key={intake} value={intake}>
                    {intake}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                label="Preferred course"
                value={isVirtual ? data.programId : data.preferredProgramme}
                onChange={(event) => {
                  if (event.target.value === notSureCourse) {
                    setData({
                      ...data,
                      programId: isVirtual ? notSureCourse : "",
                      preferredProgramme: notSureCourse,
                    });
                    return;
                  }
                  const selectedProgramme = programmes.find((programme) => (
                    String(isVirtual ? programme.id : programme.name) === String(event.target.value)
                  ));
                  setData({
                    ...data,
                    programId: isVirtual ? event.target.value : "",
                    preferredProgramme: selectedProgramme?.name || "",
                  });
                }}
                required
                fullWidth
              >
                {programmes.map((programme) => (
                  <MenuItem
                    key={programme.id || programme.name}
                    value={isVirtual ? programme.id : programme.name}
                  >
                    {programme.name}
                  </MenuItem>
                ))}
                <MenuItem value={notSureCourse}>
                  {notSureCourse}
                </MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                label="Education level"
                value={data.educationLevel}
                onChange={(event) => {
                  setData({
                    ...data,
                    educationLevel: event.target.value,
                    educationResult: "",
                  });
                }}
                fullWidth
              >
                {educationLevels.map((level) => (
                  <MenuItem key={level} value={level}>
                    {level}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            {data.educationLevel === "KCSE" && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  select
                  label="KCSE mean grade"
                  value={data.educationResult}
                  onChange={(event) => setData("educationResult", event.target.value)}
                  required
                  fullWidth
                  helperText="Select the mean grade shown on the KCSE certificate."
                >
                  {KCSE_GRADES.map((grade) => (
                    <MenuItem key={grade} value={grade}>
                      {grade}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            )}
          </Grid>
        </Box>

        <Divider sx={{ borderStyle: "dashed" }} />

        {/* Section: Additional */}
        <Box>
          <FormSectionHeader icon={<Email fontSize="small" />} title="Additional Information" brand={brand} />
          <Typography variant="body2" sx={{ color: brand.mutedText, ml: 7, mb: 2 }}>
            Anything else you&apos;d like us to know?
          </Typography>
          <TextField
            label="Message"
            value={data.message}
            onChange={(event) => setData("message", event.target.value)}
            multiline
            rows={4}
            fullWidth
          />
        </Box>

        {/* Submit */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "stretch", sm: "center" },
            gap: 2,
            pt: 1,
          }}
        >
          <Typography variant="body2" sx={{ color: brand.mutedText }}>
            Fields marked with * are required.
          </Typography>
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={processing}
            startIcon={<Send />}
            sx={{
              bgcolor: brand.accent,
              fontWeight: 800,
              px: 5,
              py: 1.8,
              fontSize: "1rem",
              borderRadius: 2.5,
              textTransform: "none",
              boxShadow: `0 8px 24px -4px ${brand.accent}50`,
              "&:hover": {
                bgcolor: brand.accentHover,
                boxShadow: `0 12px 28px -4px ${brand.accent}70`,
                transform: "translateY(-1px)",
              },
              transition: "all 0.2s ease",
            }}
          >
            {processing ? "Submitting..." : "Submit Application"}
          </Button>
        </Box>
      </Stack>
    </Paper>
  );

  /* ── VIRTUAL CAMPUS VARIANT ────────────────────────────────── */
  if (isVirtual) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: brand.softBlue }}>
        <Head title="Apply Now - AIRADS Virtual Campus" />

        <Box component="main" sx={{ py: { xs: 4, md: 7 } }}>
          <Container maxWidth="md">
            <Stack spacing={3} sx={{ alignItems: "center" }}>
              {centeredLogo}
              {applicationForm}
            </Stack>
          </Container>
        </Box>
      </Box>
    );
  }

  /* ── MAIN WEBSITE VARIANT ──────────────────────────────────── */
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: brand.softBlue }}>
      <Head title="Apply Now - AIRADS College" />

      <Box component="main" sx={{ py: { xs: 4, md: 7 } }}>
        <Container maxWidth="md">
          <Stack spacing={3} sx={{ alignItems: "center" }}>
            {centeredLogo}
            {applicationForm}
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}
