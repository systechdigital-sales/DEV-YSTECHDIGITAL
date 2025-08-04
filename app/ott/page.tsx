"use client"

import type React from "react"
import { useState, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { Upload, CreditCard, CheckCircle, AlertCircle, Home, User, Package, Shield, Clock } from "lucide-react"
import Image from "next/image"

interface FormData {
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  streetAddress: string
  addressLine2: string
  city: string
  state: string
  postalCode: string
  country: string
  purchaseType: string
  activationCode: string
  purchaseDate: string
  invoiceNumber: string
  sellerName: string
  billFile: File | null
  agreeToTerms: boolean
}

// Comprehensive mapping of Indian states to their cities
const stateCityMapping: Record<string, string[]> = {
  "Andhra Pradesh": [
    "Visakhapatnam",
    "Vijayawada",
    "Guntur",
    "Nellore",
    "Kurnool",
    "Rajahmundry",
    "Kadapa",
    "Kakinada",
    "Tirupati",
    "Anantapur",
    "Vizianagaram",
    "Eluru",
    "Ongole",
    "Nandyal",
    "Machilipatnam",
    "Adoni",
    "Tenali",
    "Chittoor",
    "Hindupur",
    "Proddatur",
    "Bhimavaram",
    "Madanapalle",
    "Guntakal",
    "Dharmavaram",
  ],
  "Arunachal Pradesh": [
    "Itanagar",
    "Naharlagun",
    "Pasighat",
    "Tezpur",
    "Bomdila",
    "Ziro",
    "Along",
    "Changlang",
    "Tezu",
    "Khonsa",
    "Seppa",
    "Yingkiong",
    "Anini",
    "Tawang",
    "Roing",
    "Daporijo",
  ],
  Assam: [
    "Guwahati",
    "Silchar",
    "Dibrugarh",
    "Jorhat",
    "Nagaon",
    "Tinsukia",
    "Tezpur",
    "Bongaigaon",
    "Karimganj",
    "Sivasagar",
    "Goalpara",
    "Barpeta",
    "North Lakhimpur",
    "Mangaldoi",
    "Diphu",
    "Haflong",
    "Kokrajhar",
    "Hailakandi",
    "Morigaon",
    "Nalbari",
    "Rangia",
    "Margherita",
    "Golaghat",
    "Dhubri",
  ],
  Bihar: [
    "Patna",
    "Gaya",
    "Bhagalpur",
    "Muzaffarpur",
    "Purnia",
    "Darbhanga",
    "Bihar Sharif",
    "Arrah",
    "Begusarai",
    "Katihar",
    "Munger",
    "Chhapra",
    "Danapur",
    "Saharsa",
    "Sasaram",
    "Hajipur",
    "Dehri",
    "Siwan",
    "Motihari",
    "Nawada",
    "Bagaha",
    "Buxar",
    "Kishanganj",
    "Sitamarhi",
  ],
  Chhattisgarh: [
    "Raipur",
    "Bhilai",
    "Korba",
    "Bilaspur",
    "Durg",
    "Rajnandgaon",
    "Jagdalpur",
    "Raigarh",
    "Ambikapur",
    "Mahasamund",
    "Dhamtari",
    "Chirmiri",
    "Janjgir",
    "Sakti",
    "Kanker",
    "Kawardha",
    "Bhatapara",
    "Dalli-Rajhara",
    "Naila Janjgir",
    "Tilda Newra",
    "Mungeli",
    "Pathalgaon",
  ],
  Goa: [
    "Panaji",
    "Vasco da Gama",
    "Margao",
    "Mapusa",
    "Ponda",
    "Bicholim",
    "Curchorem",
    "Sanquelim",
    "Cuncolim",
    "Canacona",
    "Quepem",
    "Pernem",
    "Sanguem",
    "Valpoi",
    "Aldona",
    "Arambol",
  ],
  Gujarat: [
    "Ahmedabad",
    "Surat",
    "Vadodara",
    "Rajkot",
    "Bhavnagar",
    "Jamnagar",
    "Junagadh",
    "Gandhinagar",
    "Anand",
    "Navsari",
    "Morbi",
    "Nadiad",
    "Surendranagar",
    "Bharuch",
    "Mehsana",
    "Bhuj",
    "Porbandar",
    "Palanpur",
    "Valsad",
    "Vapi",
    "Gondal",
    "Veraval",
    "Godhra",
    "Patan",
  ],
  Haryana: [
    "Faridabad",
    "Gurgaon",
    "Panipat",
    "Ambala",
    "Yamunanagar",
    "Rohtak",
    "Hisar",
    "Karnal",
    "Sonipat",
    "Panchkula",
    "Bhiwani",
    "Sirsa",
    "Bahadurgarh",
    "Jind",
    "Thanesar",
    "Kaithal",
    "Palwal",
    "Rewari",
    "Hansi",
    "Narnaul",
    "Fatehabad",
    "Gohana",
    "Tohana",
    "Narwana",
  ],
  "Himachal Pradesh": [
    "Shimla",
    "Dharamshala",
    "Solan",
    "Mandi",
    "Palampur",
    "Baddi",
    "Nahan",
    "Paonta Sahib",
    "Sundernagar",
    "Chamba",
    "Una",
    "Kullu",
    "Hamirpur",
    "Bilaspur",
    "Yol",
    "Jubbal",
    "Chail",
    "Kasauli",
    "Manali",
    "Dalhousie",
    "Keylong",
    "Reckong Peo",
    "Kalpa",
    "Sangla",
  ],
  Jharkhand: [
    "Ranchi",
    "Jamshedpur",
    "Dhanbad",
    "Bokaro",
    "Deoghar",
    "Phusro",
    "Hazaribagh",
    "Giridih",
    "Ramgarh",
    "Medininagar",
    "Chirkunda",
    "Pakaur",
    "Chaibasa",
    "Dumka",
    "Sahibganj",
    "Gumla",
    "Lohardaga",
    "Simdega",
    "Chatra",
    "Koderma",
    "Jamtara",
    "Rajmahal",
    "Mihijam",
    "Patratu",
  ],
  Karnataka: [
    "Bangalore",
    "Mysore",
    "Hubli-Dharwad",
    "Mangalore",
    "Belgaum",
    "Gulbarga",
    "Davanagere",
    "Bellary",
    "Bijapur",
    "Shimoga",
    "Tumkur",
    "Raichur",
    "Bidar",
    "Hospet",
    "Hassan",
    "Gadag-Betageri",
    "Udupi",
    "Bhadravati",
    "Chitradurga",
    "Kolar",
    "Mandya",
    "Chikmagalur",
    "Gangavati",
    "Bagalkot",
  ],
  Kerala: [
    "Thiruvananthapuram",
    "Kochi",
    "Kozhikode",
    "Kollam",
    "Thrissur",
    "Alappuzha",
    "Palakkad",
    "Kannur",
    "Kasaragod",
    "Kottayam",
    "Malappuram",
    "Pathanamthitta",
    "Idukki",
    "Wayanad",
    "Ernakulam",
    "Thodupuzha",
    "Kayamkulam",
    "Neyyattinkara",
    "Changanassery",
    "Kanhangad",
    "Tellicherry",
    "Koyilandy",
    "Mananthavady",
    "Sulthan Bathery",
  ],
  "Madhya Pradesh": [
    "Indore",
    "Bhopal",
    "Jabalpur",
    "Gwalior",
    "Ujjain",
    "Sagar",
    "Dewas",
    "Satna",
    "Ratlam",
    "Rewa",
    "Murwara",
    "Singrauli",
    "Burhanpur",
    "Khandwa",
    "Bhind",
    "Chhindwara",
    "Guna",
    "Shivpuri",
    "Vidisha",
    "Chhatarpur",
    "Damoh",
    "Mandsaur",
    "Khargone",
    "Neemuch",
  ],
  Maharashtra: [
    "Mumbai",
    "Pune",
    "Nagpur",
    "Thane",
    "Nashik",
    "Aurangabad",
    "Solapur",
    "Amravati",
    "Kolhapur",
    "Sangli",
    "Jalgaon",
    "Akola",
    "Latur",
    "Dhule",
    "Ahmednagar",
    "Chandrapur",
    "Parbhani",
    "Ichalkaranji",
    "Jalna",
    "Ambarnath",
    "Bhusawal",
    "Panvel",
    "Badlapur",
    "Beed",
  ],
  Manipur: [
    "Imphal",
    "Thoubal",
    "Bishnupur",
    "Churachandpur",
    "Senapati",
    "Ukhrul",
    "Chandel",
    "Tamenglong",
    "Jiribam",
    "Kangpokpi",
    "Tengnoupal",
    "Pherzawl",
    "Noney",
    "Kamjong",
    "Kakching",
    "Mayang Imphal",
  ],
  Meghalaya: [
    "Shillong",
    "Tura",
    "Jowai",
    "Nongpoh",
    "Baghmara",
    "Williamnagar",
    "Nongstoin",
    "Mawkyrwat",
    "Resubelpara",
    "Ampati",
    "Mairang",
    "Khliehriat",
    "Amlarem",
    "Ranikor",
    "Mawsynram",
    "Cherrapunji",
  ],
  Mizoram: [
    "Aizawl",
    "Lunglei",
    "Saiha",
    "Champhai",
    "Kolasib",
    "Serchhip",
    "Mamit",
    "Lawngtlai",
    "Saitual",
    "Khawzawl",
    "Hnahthial",
    "Bairabi",
    "Vairengte",
    "Tlabung",
    "Zawlnuam",
    "Thenzawl",
  ],
  Nagaland: [
    "Kohima",
    "Dimapur",
    "Mokokchung",
    "Tuensang",
    "Wokha",
    "Zunheboto",
    "Phek",
    "Kiphire",
    "Longleng",
    "Mon",
    "Noklak",
    "Chumukedima",
    "Tuli",
    "Jalukie",
    "Tizit",
    "Aboi",
  ],
  Odisha: [
    "Bhubaneswar",
    "Cuttack",
    "Rourkela",
    "Brahmapur",
    "Sambalpur",
    "Puri",
    "Balasore",
    "Bhadrak",
    "Baripada",
    "Jharsuguda",
    "Jeypore",
    "Barbil",
    "Khordha",
    "Balangir",
    "Rayagada",
    "Koraput",
    "Kendujhar",
    "Sunabeda",
    "Paradip",
    "Dhenkanal",
    "Angul",
    "Talcher",
    "Kendrapara",
    "Jajpur",
  ],
  Punjab: [
    "Ludhiana",
    "Amritsar",
    "Jalandhar",
    "Patiala",
    "Bathinda",
    "Mohali",
    "Firozpur",
    "Batala",
    "Pathankot",
    "Moga",
    "Abohar",
    "Malerkotla",
    "Khanna",
    "Phagwara",
    "Muktsar",
    "Barnala",
    "Rajpura",
    "Hoshiarpur",
    "Kapurthala",
    "Faridkot",
    "Sunam",
    "Sangrur",
    "Nawanshahr",
    "Gurdaspur",
  ],
  Rajasthan: [
    "Jaipur",
    "Jodhpur",
    "Kota",
    "Bikaner",
    "Ajmer",
    "Udaipur",
    "Bhilwara",
    "Alwar",
    "Bharatpur",
    "Sikar",
    "Pali",
    "Sri Ganganagar",
    "Kishangarh",
    "Baran",
    "Dhaulpur",
    "Tonk",
    "Beawar",
    "Hanumangarh",
    "Churu",
    "Nagaur",
    "Jhunjhunu",
    "Chittorgarh",
    "Jaisalmer",
    "Banswara",
  ],
  Sikkim: [
    "Gangtok",
    "Namchi",
    "Geyzing",
    "Mangan",
    "Jorethang",
    "Nayabazar",
    "Rangpo",
    "Singtam",
    "Yuksom",
    "Pelling",
    "Ravangla",
    "Lachung",
    "Lachen",
    "Chungthang",
    "Dzongri",
    "Tsomgo",
  ],
  "Tamil Nadu": [
    "Chennai",
    "Coimbatore",
    "Madurai",
    "Tiruchirappalli",
    "Salem",
    "Tirunelveli",
    "Tiruppur",
    "Vellore",
    "Erode",
    "Thoothukkudi",
    "Dindigul",
    "Thanjavur",
    "Ranipet",
    "Sivakasi",
    "Karur",
    "Udhagamandalam",
    "Hosur",
    "Nagercoil",
    "Kanchipuram",
    "Kumarakonam",
    "Pudukkottai",
    "Ambur",
    "Pallavaram",
    "Tambaram",
  ],
  Telangana: [
    "Hyderabad",
    "Warangal",
    "Nizamabad",
    "Khammam",
    "Karimnagar",
    "Ramagundam",
    "Mahbubnagar",
    "Nalgonda",
    "Adilabad",
    "Suryapet",
    "Miryalaguda",
    "Jagtial",
    "Mancherial",
    "Nirmal",
    "Kothagudem",
    "Bodhan",
    "Sangareddy",
    "Metpally",
    "Zaheerabad",
    "Medak",
    "Kamareddy",
    "Vikarabad",
    "Wanaparthy",
    "Gadwal",
  ],
  Tripura: [
    "Agartala",
    "Dharmanagar",
    "Udaipur",
    "Kailasahar",
    "Belonia",
    "Khowai",
    "Pratapgarh",
    "Ranirbazar",
    "Sonamura",
    "Kumarghat",
    "Bilonia",
    "Amarpur",
    "Teliamura",
    "Sabroom",
    "Kamalpur",
    "Panisagar",
  ],
  "Uttar Pradesh": [
    "Lucknow",
    "Kanpur",
    "Ghaziabad",
    "Agra",
    "Varanasi",
    "Meerut",
    "Allahabad",
    "Bareilly",
    "Aligarh",
    "Moradabad",
    "Saharanpur",
    "Gorakhpur",
    "Noida",
    "Firozabad",
    "Jhansi",
    "Muzaffarnagar",
    "Mathura",
    "Rampur",
    "Shahjahanpur",
    "Farrukhabad",
    "Mau",
    "Hapur",
    "Etawah",
    "Mirzapur",
  ],
  Uttarakhand: [
    "Dehradun",
    "Haridwar",
    "Roorkee",
    "Haldwani-cum-Kathgodam",
    "Rudrapur",
    "Kashipur",
    "Rishikesh",
    "Pithoragarh",
    "Ramnagar",
    "Jaspur",
    "Manglaur",
    "Laksar",
    "Sitarganj",
    "Pauri",
    "Kotdwar",
    "Nagla",
    "Sultanpur",
    "Bazpur",
    "Kichha",
    "Almora",
    "Mussoorie",
    "Nainital",
    "Bageshwar",
    "Champawat",
  ],
  "West Bengal": [
    "Kolkata",
    "Howrah",
    "Durgapur",
    "Asansol",
    "Siliguri",
    "Malda",
    "Bardhaman",
    "Baharampur",
    "Habra",
    "Kharagpur",
    "Shantipur",
    "Dankuni",
    "Dhulian",
    "Ranaghat",
    "Haldia",
    "Raiganj",
    "Krishnanagar",
    "Nabadwip",
    "Medinipur",
    "Jalpaiguri",
    "Balurghat",
    "Basirhat",
    "Bankura",
    "Purulia",
  ],
  "Andaman and Nicobar Islands": [
    "Port Blair",
    "Bamboo Flat",
    "Garacharma",
    "Diglipur",
    "Mayabunder",
    "Rangat",
    "Campbell Bay",
    "Car Nicobar",
    "Hut Bay",
    "Nancowry",
    "Little Andaman",
    "Neil Island",
    "Havelock Island",
    "Baratang",
  ],
  Chandigarh: ["Chandigarh", "Sector 17", "Sector 22", "Sector 35", "Manimajra", "Sector 43", "Sector 15"],
  "Dadra and Nagar Haveli and Daman and Diu": [
    "Daman",
    "Diu",
    "Silvassa",
    "Naroli",
    "Rampura",
    "Khanvel",
    "Samarvarni",
    "Khadoli",
    "Dunetha",
    "Masat",
    "Velugam",
    "Moti Daman",
    "Nani Daman",
    "Vanakbara",
    "Nagoa",
  ],
  Delhi: [
    "New Delhi",
    "North Delhi",
    "South Delhi",
    "East Delhi",
    "West Delhi",
    "Central Delhi",
    "North East Delhi",
    "North West Delhi",
    "South East Delhi",
    "South West Delhi",
    "Shahdara",
    "Dwarka",
    "Rohini",
    "Najafgarh",
  ],
  Lakshadweep: [
    "Kavaratti",
    "Agatti",
    "Minicoy",
    "Amini",
    "Andrott",
    "Kalpeni",
    "Kadmat",
    "Kiltan",
    "Chetlat",
    "Bitra",
    "Bangaram",
    "Thinnakara",
    "Parali I",
    "Parali II",
    "Suheli Par",
  ],
  Puducherry: [
    "Puducherry",
    "Karaikal",
    "Yanam",
    "Mahe",
    "Villianur",
    "Ariyankuppam",
    "Bahour",
    "Nettapakkam",
    "Mannadipet",
    "Embalam",
    "Kirumampakkam",
    "Mudaliarpet",
    "Ozhukarai",
    "Thattanchavady",
    "Uppalam",
  ],
}

// Get all states
const indianStates = Object.keys(stateCityMapping).sort()

export default function OTTClaimPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    streetAddress: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
    purchaseType: "",
    activationCode: "",
    purchaseDate: "",
    invoiceNumber: "",
    sellerName: "",
    billFile: null,
    agreeToTerms: false,
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [activationCodeValidationMessage, setActivationCodeValidationMessage] = useState("")
  const [activationCodeValidationStatus, setActivationCodeValidationStatus] = useState<"idle" | "success" | "error">(
    "idle",
  )
  const [failedValidationAttempts, setFailedValidationAttempts] = useState(0)
  const [showCaptcha, setShowCaptcha] = useState(false)
  const [captchaChecked, setCaptchaChecked] = useState(false)

  // Get cities for selected state
  const availableCities = useMemo(() => {
    if (!formData.state) return []
    return stateCityMapping[formData.state] || []
  }, [formData.state])

  const handleInputChange = (field: keyof FormData, value: string | boolean | File | null) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value }

      // Reset city when state changes
      if (field === "state") {
        newData.city = ""
      }

      return newData
    })

    if (error) setError("")
    if (field === "activationCode") {
      setActivationCodeValidationMessage("")
      setActivationCodeValidationStatus("idle")
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    if (file) {
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "application/pdf"]
      const maxSize = 5 * 1024 * 1024 // 5MB

      if (!allowedTypes.includes(file.type)) {
        setError("Please upload a valid file (JPG, PNG, or PDF)")
        handleInputChange("billFile", null)
        return
      }

      if (file.size > maxSize) {
        setError("File size must be less than 5MB")
        handleInputChange("billFile", null)
        return
      }
    }
    handleInputChange("billFile", file)
  }

  const verifyActivationCode = useCallback(async (code: string) => {
    if (!code) {
      setActivationCodeValidationMessage("")
      setActivationCodeValidationStatus("idle")
      return
    }

    try {
      const response = await fetch("/api/ott-claim/verify-activation-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ activationCode: code }),
      })

      const data = await response.json()

      if (data.success) {
        setActivationCodeValidationMessage("Activation code is valid and available. You can proceed.")
        setActivationCodeValidationStatus("success")
        setFailedValidationAttempts(0)
        setShowCaptcha(false)
        setCaptchaChecked(false)
      } else {
        setActivationCodeValidationMessage(data.error || "Activation code validation failed.")
        setActivationCodeValidationStatus("error")
        setFailedValidationAttempts((prev) => {
          const newAttempts = prev + 1
          if (newAttempts >= 3) {
            setShowCaptcha(true)
          }
          return newAttempts
        })
      }
    } catch (err) {
      console.error("Error verifying activation code:", err)
      setActivationCodeValidationMessage("Network error during code verification.")
      setActivationCodeValidationStatus("error")
      setFailedValidationAttempts((prev) => {
        const newAttempts = prev + 1
        if (newAttempts >= 3) {
          setShowCaptcha(true)
        }
        return newAttempts
      })
    }
  }, [])

  const validateForm = (): boolean => {
    console.log("Starting form validation...")
    const requiredFields: (keyof FormData)[] = [
      "firstName",
      "lastName",
      "email",
      "phoneNumber",
      "streetAddress",
      "city",
      "state",
      "postalCode",
      "purchaseType",
      "activationCode",
      "purchaseDate",
    ]

    for (const field of requiredFields) {
      if (!formData[field]) {
        const fieldName = field.replace(/([A-Z])/g, " $1").toLowerCase()
        setError(`Please fill in the ${fieldName} field`)
        console.log(`Validation failed: ${fieldName} is empty.`)
        return false
      }
    }

    // Conditional validation for hardware purchase
    if (formData.purchaseType === "hardware") {
      if (!formData.invoiceNumber) {
        setError("Invoice Number is required for Hardware Purchase")
        console.log("Validation failed: Invoice Number is empty for Hardware Purchase.")
        return false
      }
      if (!formData.sellerName) {
        setError("Seller Name is required for Hardware Purchase")
        console.log("Validation failed: Seller Name is empty for Hardware Purchase.")
        return false
      }
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address")
      console.log("Validation failed: Invalid email format.")
      return false
    }

    // Phone validation
    const phoneRegex = /^[6-9]\d{9}$/
    if (!phoneRegex.test(formData.phoneNumber)) {
      setError("Please enter a valid 10-digit Indian mobile number")
      console.log("Validation failed: Invalid phone number format.")
      return false
    }

    // Postal Code validation
    const postalCodeRegex = /^\d{6}$/
    if (!postalCodeRegex.test(formData.postalCode)) {
      setError("Please enter a valid 6-digit postal code.")
      console.log("Validation failed: Invalid postal code format.")
      return false
    }

    // Terms and conditions validation
    if (!formData.agreeToTerms) {
      setError("Please agree to the Terms and Conditions to proceed.")
      console.log("Validation failed: Terms and conditions not agreed.")
      return false
    }

    // Final check for activation code status before submission
    if (activationCodeValidationStatus !== "success") {
      setError("Please verify your activation code. It must be valid and available to proceed.")
      console.log("Validation failed: Activation code not verified or invalid.")
      return false
    }

    if (showCaptcha && !captchaChecked) {
      setError("Please complete the captcha to proceed.")
      console.log("Validation failed: Captcha not completed.")
      return false
    }

    console.log("Form validation successful.")
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Attempting to submit form...")

    if (!validateForm()) {
      console.log("Form validation failed, stopping submission.")
      return
    }

    setLoading(true)
    setError("")
    setSuccess("")
    console.log("Validation passed. Setting loading state and clearing messages.")

    try {
      const submitData = new FormData()

      // Add all form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "billFile" && value instanceof File) {
          submitData.append(key, value)
        } else if (key !== "billFile") {
          submitData.append(key, String(value))
        }
      })

      console.log("FormData prepared:", Object.fromEntries(submitData.entries()))

      const response = await fetch("/api/ott-claim/submit", {
        method: "POST",
        body: submitData,
      })

      console.log("API response received. Status:", response.status)
      const data = await response.json()
      console.log("API response data:", data)

      if (data.success) {
        setSuccess("Claim submitted successfully! Redirecting to payment...")
        console.log("Claim submission successful. Redirecting...")
        setTimeout(() => {
          router.push(data.redirectUrl)
        }, 2000)
      } else {
        setError(data.message || "Failed to submit claim. Please try again.")
        console.error("Claim submission failed:", data.message)
      }
    } catch (error) {
      console.error("Error submitting claim:", error)
      setError("Network error. Please check your connection and try again.")
    } finally {
      setLoading(false)
      console.log("Submission process finished. Loading state reset.")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-black via-red-900 to-black shadow-lg border-b border-red-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center">
              <Image
                src="/logo.png"
                alt="SYSTECH DIGITAL Logo"
                width={40}
                height={40}
                className="rounded-full mr-3"
              />
              <div className="text-center sm:text-left">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">OTT Subscription Claim Form</h1>
                <p className="text-xs sm:text-sm text-red-200 mt-1">Get your OTTplay Power Play Pack activation code</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/")}
                className="text-white hover:bg-white/20"
              >
                <Home className="w-4 h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Home</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/customer-login")}
                className="text-white hover:bg-white/20 border border-white/30"
              >
                <User className="w-4 h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">My Dashboard</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Progress Indicator */}
        <div className="mb-6 lg:mb-8">
          <div className="flex items-center justify-center space-x-2 sm:space-x-4">
            <div className="flex items-center">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold">
                1
              </div>
              <span className="ml-1 sm:ml-2 text-xs sm:text-sm font-medium text-blue-600">Submit Claim</span>
            </div>
            <div className="w-8 sm:w-16 h-1 bg-gray-200 rounded"></div>
            <div className="flex items-center">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold">
                2
              </div>
              <span className="ml-1 sm:ml-2 text-xs sm:text-sm font-medium text-gray-500">Payment</span>
            </div>
            <div className="w-8 sm:w-16 h-1 bg-gray-200 rounded"></div>
            <div className="flex items-center">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold">
                3
              </div>
              <span className="ml-1 sm:ml-2 text-xs sm:text-sm font-medium text-gray-500">Get Code</span>
            </div>
          </div>
        </div>

        {/* Alert Messages */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-6 lg:space-y-8">
          {/* Personal Information */}
          <Card className="shadow-xl border-0">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg border-b">
              <CardTitle className="flex items-center text-lg sm:text-xl">
                <User className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 text-blue-600" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    className="mt-1"
                    placeholder="Enter your first name"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    className="mt-1"
                    placeholder="Enter your last name"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="mt-1"
                    placeholder="Enter your email address"
                  />
                </div>
                <div>
                  <Label htmlFor="phoneNumber">Phone Number *</Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                    className="mt-1"
                    placeholder="Enter 10-digit mobile number"
                    maxLength={10}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Address Information */}
          <Card className="shadow-xl border-0">
            <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 rounded-t-lg border-b">
              <CardTitle className="flex items-center text-lg sm:text-xl">
                <Home className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 text-green-600" />
                Address Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <Label htmlFor="streetAddress">Street Address *</Label>
                  <Input
                    id="streetAddress"
                    type="text"
                    value={formData.streetAddress}
                    onChange={(e) => handleInputChange("streetAddress", e.target.value)}
                    className="mt-1"
                    placeholder="Enter your street address"
                  />
                </div>
                <div>
                  <Label htmlFor="addressLine2">Address Line 2 (Optional)</Label>
                  <Input
                    id="addressLine2"
                    type="text"
                    value={formData.addressLine2}
                    onChange={(e) => handleInputChange("addressLine2", e.target.value)}
                    className="mt-1"
                    placeholder="Apartment, suite, etc."
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  <div className="sm:col-span-2 lg:col-span-1">
                    <Label htmlFor="state">State *</Label>
                    <Select value={formData.state} onValueChange={(value) => handleInputChange("state", value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select your state" />
                      </SelectTrigger>
                      <SelectContent>
                        {indianStates.map((state) => (
                          <SelectItem key={state} value={state}>
                            {state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="sm:col-span-2 lg:col-span-1">
                    <Label htmlFor="city">City *</Label>
                    <Select
                      value={formData.city}
                      onValueChange={(value) => handleInputChange("city", value)}
                      disabled={!formData.state}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder={formData.state ? "Select your city" : "Select state first"} />
                      </SelectTrigger>
                      <SelectContent>
                        {availableCities.map((city) => (
                          <SelectItem key={city} value={city}>
                            {city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="postalCode">Postal Code *</Label>
                    <Input
                      id="postalCode"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={formData.postalCode}
                      onChange={(e) => handleInputChange("postalCode", e.target.value)}
                      className="mt-1"
                      placeholder="Enter postal code"
                      maxLength={6}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Select value={formData.country} onValueChange={(value) => handleInputChange("country", value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="India">India</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Purchase Information */}
          <Card className="shadow-xl border-0">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-lg border-b">
              <CardTitle className="flex items-center text-lg sm:text-xl">
                <Package className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 text-purple-600" />
                Purchase Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <Label htmlFor="purchaseType">Purchase Type *</Label>
                  <Select
                    value={formData.purchaseType}
                    onValueChange={(value) => handleInputChange("purchaseType", value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select purchase type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hardware">Hardware Purchase</SelectItem>
                      <SelectItem value="software">Software Purchase</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="activationCode">Activation Code/Product Serial Number/IMEI Number *</Label>
                  <Input
                    id="activationCode"
                    type="text"
                    value={formData.activationCode}
                    onChange={(e) => handleInputChange("activationCode", e.target.value.toUpperCase())}
                    onBlur={(e) => verifyActivationCode(e.target.value.toUpperCase())}
                    className="mt-1 font-mono"
                    placeholder="Enter your activation code"
                  />
                  {activationCodeValidationMessage && (
                    <p
                      className={`text-sm mt-1 ${activationCodeValidationStatus === "success" ? "text-green-600" : "text-red-600"}`}
                    >
                      {activationCodeValidationMessage}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">This is the code you received with your purchase</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <Label htmlFor="purchaseDate">Purchase Date *</Label>
                    <Input
                      id="purchaseDate"
                      type="date"
                      value={formData.purchaseDate}
                      onChange={(e) => handleInputChange("purchaseDate", e.target.value)}
                      className="mt-1"
                      max={new Date().toISOString().split("T")[0]}
                    />
                  </div>
                  <div>
                    <Label htmlFor="invoiceNumber">
                      Invoice Number {formData.purchaseType === "hardware" ? "*" : "(Optional)"}
                    </Label>
                    <Input
                      id="invoiceNumber"
                      type="text"
                      value={formData.invoiceNumber}
                      onChange={(e) => handleInputChange("invoiceNumber", e.target.value)}
                      className="mt-1"
                      placeholder="Enter invoice number"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="sellerName">
                    Seller Name {formData.purchaseType === "hardware" ? "*" : "(Optional)"}
                  </Label>
                  <Input
                    id="sellerName"
                    type="text"
                    value={formData.sellerName}
                    onChange={(e) => handleInputChange("sellerName", e.target.value)}
                    className="mt-1"
                    placeholder="Enter seller or store name"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Document Upload */}
          <Card className="shadow-xl border-0">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 rounded-t-lg border-b">
              <CardTitle className="flex items-center text-lg sm:text-xl">
                <Upload className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 text-orange-600" />
                Document Upload
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div>
                <Label htmlFor="billFile">Purchase Bill/Receipt (Optional)</Label>
                <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 text-center hover:border-blue-400 transition-colors">
                  <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 mx-auto mb-2" />
                  <div className="text-sm text-gray-600 mb-2">
                    {formData.billFile ? (
                      <span className="text-green-600 font-medium break-all">{formData.billFile.name}</span>
                    ) : (
                      "Click to upload or drag and drop"
                    )}
                  </div>
                  <p className="text-xs text-gray-500">JPG, PNG or PDF (Max 5MB)</p>
                  <input
                    id="billFile"
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2 bg-transparent"
                    onClick={() => document.getElementById("billFile")?.click()}
                  >
                    Choose File
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          

          {/* Terms and Conditions */}
          <Card className="shadow-xl border-0">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onCheckedChange={(checked) => handleInputChange("agreeToTerms", checked as boolean)}
                  className="mt-1 flex-shrink-0"
                />
                <div className="text-sm">
                  <Label htmlFor="agreeToTerms" className="cursor-pointer">
                    I agree to the{" "}
                    <Button
                      type="button"
                      variant="link"
                      className="p-0 h-auto text-blue-600 underline"
                      onClick={() => router.push("/terms-and-conditions")}
                    >
                      Terms and Conditions
                    </Button>{" "}
                    and{" "}
                    <Button
                      type="button"
                      variant="link"
                      className="p-0 h-auto text-blue-600 underline"
                      onClick={() => router.push("/privacy-policy")}
                    >
                      Privacy Policy
                    </Button>
                  </Label>
                  <p className="text-gray-500 mt-1">
                    By submitting this claim, you confirm that all information provided is accurate and complete.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-center">
            <Button
              type="submit"
              disabled={loading ||  activationCodeValidationStatus !== "success"}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 sm:px-12 py-3 sm:py-4 text-base sm:text-lg font-semibold shadow-xl w-full sm:w-auto"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 h-4 sm:h-5 sm:w-5 border-b-2 border-white mr-2"></div>
                  Submitting Claim...
                </>
              ) : (
                <>
                  <span className="hidden sm:inline">Submit Claim & Proceed to Payment</span>
                  <span className="sm:hidden">Submit & Pay</span>
                  <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mt-8 sm:mt-12">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-4 sm:p-6 text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Secure Process</h4>
              <p className="text-xs sm:text-sm text-gray-600">
                Your data is encrypted and protected with industry-standard security measures.
              </p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-4 sm:p-6 text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Quick Processing</h4>
              <p className="text-xs sm:text-sm text-gray-600">
                Claims are processed within 24-48 hours after successful payment verification.
              </p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-4 sm:p-6 text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Guaranteed Delivery</h4>
              <p className="text-xs sm:text-sm text-gray-600">
                100% genuine OTT codes delivered directly to your email address.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
