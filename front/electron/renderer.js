
const func = async () => {
    const response = await window.versions.ping()
    const userId = versions.generateUserId()
    userId.updateUserId(userId)
    console.log(response) // prints out 'pong'
  }
  
  func()