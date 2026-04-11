function adminLogin() {
    Swal.fire({ 
        title: 'Ruthless Access', 
        input: 'password', 
        confirmButtonText: 'UNLOCK', 
        confirmButtonColor: '#ff0000' 
    }).then((res) => {
        if (res.isConfirmed && res.value === "0000") {
            window.location.href = "admin.html";
        } else if (res.isConfirmed) {
            Swal.fire({ 
                icon: 'error', 
                title: 'DENIED', 
                background: '#0a0a0a', 
                color: '#fff' 
            });
        }
    });
}
