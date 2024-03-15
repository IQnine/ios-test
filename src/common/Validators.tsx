export const EmailValidator = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

 export const PasswordValidator = (password:string) => {
    const minLength = 8; // Minimum password length
    const hasUpperCase = /[A-Z]/.test(password); // Check for uppercase letters
    const hasLowerCase = /[a-z]/.test(password); // Check for lowercase letters
    const hasNumber = /[0-9]/.test(password); // Check for numbers
    return (
      password.length >= minLength &&
      hasUpperCase &&
      hasLowerCase &&
      hasNumber
    );
  };