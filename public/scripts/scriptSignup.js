
document.addEventListener('DOMContentLoaded', () => {

    //handling white space error
    document.querySelectorAll('.whiteSpace').forEach(element => { 
        element.addEventListener('keypress', event => {
            if (event.key === ' ') {
                event.preventDefault();
                
                Swal.fire({
                    text: 'White Space is not allowed',
                    width: '50%',
                });      
            };
        })
    });

    const signupForm = document.querySelector('.form-signup');

    signupForm.addEventListener('submit', (event) => {

        event.preventDefault();

        const userName = document.querySelector('#userName').value;
        const email = document.querySelector('#email').value;
        const mobile = document.querySelector('input[name="mobile"]').value;
        const password = document.querySelector('#password').value;
        const confirmPassword = document.querySelector('input[name="confirm"]').value;

        //userName validation
        const usernameValidation = /^[a-zA-Z0-9_]+$/;
        if(!userName.match(usernameValidation)){
            Swal.fire({
                html: '<p>Invalid username.</p><p>Please use only letters (a-z or A-Z), digits (0-9), and underscores (_).</p>',                
                width: '50%',
                icon : 'error'
            });
            return;
        }

        //mobile number validation
        const mobileValidation = /^\d{10}$/;
        if(!mobile.match(mobileValidation || isNaN(mobile))) {
            Swal.fire({
                text: 'Please Enter a Valid Mobile Number',
                width: '50%',
                icon : 'error'
            });
            return;
        }

        //email validation Regex
        const emailValidation = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i;            if(!email.match(emailValidation)) {
            Swal.fire({
                text: 'Please Enter a Valid Email',
                width: '50%',
                icon : 'warning'
            });
            return;
        };   
        
        //password validation
        if(password.length < 6 || password.length > 8){
            Swal.fire({
                text : 'Password must be between 6-8 characters long',
                icon : 'info',
                width : '50%'
            });
            return;
        };

        //confirm password
        if(password !== confirmPassword){
            Swal.fire({
                text : 'Entered Password is Incorrect',
                icon : 'error',
                width : '50%'
            });
            return;
        }

        signupForm.submit();

        });

});


