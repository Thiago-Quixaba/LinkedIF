(() => {
    try {
        const login = localStorage.getItem("login");
        const tipo = localStorage.getItem("type");
        const user = localStorage.getItem("user");

        if (login === "true") {
            if (tipo === "aluno") {
                window.location.href = `/home/aluno/${user}`; 
            } else if (tipo === "professor") {
                window.location.href = `/home/professor/${user}`; 
            }
        } else {
            window.location.href = `/login`;
        }
    } catch {
        window.location.href = `/login`;
    }
})();
