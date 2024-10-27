const loginText = document.querySelector(".title-text .login");
const loginForm = document.querySelector("form.login");
const loginBtn = document.querySelector("label.login");
const signupBtn = document.querySelector("label.signup");
const signupLink = document.querySelector("form .signup-link a");

signupBtn.onclick = (()=>{
  loginForm.style.marginLeft = "-50%";
  loginText.style.marginLeft = "-50%";
  loginForm.classList.add("form-signup"); /* add the signup form class */
  /*loginForm.classList.remove("form-login");  remove the login form class */
});

loginBtn.onclick = (()=>{
  loginForm.style.marginLeft = "0%";
  loginText.style.marginLeft = "0%";
  loginForm.classList.add("form-login"); /* add the login form class */
  /*loginForm.classList.remove("form-signup");  remove the signup form class */
});

signupLink.onclick = (()=>{
  signupBtn.click();
  return false;
});