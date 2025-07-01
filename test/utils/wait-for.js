export default async (condition, action, timeout = 5000) => {
  const start = Date.now()
  
  while (true) {
    const result = await condition();
    if (result) {
      break;
    }
    
    if (Date.now() - start > timeout) {
      throw new Error(`Timeout waiting for condition after ${timeout}ms`)
    }
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  
  return action()
}
