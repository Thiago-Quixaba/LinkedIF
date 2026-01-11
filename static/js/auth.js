(async () => {
    try {
        const pathParts = window.location.pathname.split("/");
        const urlId = pathParts[pathParts.length - 1];
        const urlType = pathParts[pathParts.length - 2];
        const token = localStorage.getItem("token");
        const user = localStorage.getItem("user");
        const login = localStorage.getItem("login");
        const tipo = localStorage.getItem("type");


        if (login !== "true") {
            throw new Error("dados ausentes");
        }

        const form = new FormData();
        form.append("token", token);
        form.append("id", user);
        form.append("type", tipo);
        form.append("url_id", urlId);
        form.append("url_type", urlType);

        const res = await fetch("/verify/token", {
            method: "POST",
            body: form
        });

        if (!res.ok) {
            throw new Error("token inválido");
        }

    } catch (e) {
        window.location.href = `/login`;
    }
})();
