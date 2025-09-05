export const verifyPayment = async (response: any, claimId: string): Promise<any> => {
  const maxAttempts = 30 // 30 attempts over 10 minutes
  const delayBetweenAttempts = 20000 // 20 seconds between attempts

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`Verifying payment (attempt ${attempt}/${maxAttempts})...`)
      logClient(`Verifying payment (attempt ${attempt}/${maxAttempts})... `)

      const verifyResponse = await fetch("/api/payment/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
          claimId,
        }),
      })

      const verifyData = await verifyResponse.json()
      console.log("Verification response:>>", verifyData)
      logClient("Verification response:>>>", verifyData)

      if (verifyData.success) {
        logClient("Payment verified successfully.", verifyData)
        return verifyData
      }

    //   if(verifyData.failure){logClient("Payment verified successfully.", verifyData)return verifyData}



      // If failed and not last attempt → wait before retry
      if (attempt < maxAttempts) {
        console.warn(
          `Verification failed, retrying in ${delayBetweenAttempts / 1000}s... (${maxAttempts - attempt} attempts remaining)`,
        )
        logClient(
          `Verification failed, retrying in ${delayBetweenAttempts / 1000}s... (${maxAttempts - attempt} attempts remaining)`,
        )
        await new Promise((res) => setTimeout(res, delayBetweenAttempts))
      } else {
        throw new Error(verifyData.error || "Payment verification failed after 10 minutes")
      }
    } catch (err) {
      console.error(`Attempt ${attempt} error:`, err)
      logClient(`Attempt ${attempt} error:`, err)
      if (attempt === maxAttempts) throw err
      await new Promise((res) => setTimeout(res, delayBetweenAttempts))
    }
  }
}

export async function logClient(message: string, data?: any) {
  try {
    await fetch("/api/log-client", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        data,
        time: new Date().toISOString(),
      }),
    })
  } catch (err) {
    console.error("Failed to send log:", err)
  }
}
