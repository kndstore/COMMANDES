document.addEventListener("DOMContentLoaded", () => {
    /* ========================================
       ÉLÉMENTS HTML
       ======================================== */
    const form = document.getElementById("orderForm");
    const modal = document.getElementById("productModal");

    const produitInput = document.getElementById("produit");
    const nomInput = document.getElementById("nom");

    const modalProductImage = document.getElementById("modalProductImage");
    const modalProductName = document.getElementById("modalProductName");
    const modalProductPrice = document.getElementById("modalProductPrice");
    const modalProductDesc = document.getElementById("modalProductDesc");
    const modalProductDelai = document.getElementById("modalProductDelai");

    const closeModalButton = document.querySelector(".close-modal");
    const closeButton = document.querySelector(".btn-close");
    const orderButton = document.getElementById("btnOrderProduct");

    const submitButton = form.querySelector(".submit-btn");
    const buttonText = form.querySelector(".btn-text");
    const buttonLoading = form.querySelector(".btn-loading");

    const successMessage = document.getElementById("successMessage");
    const formErrorMessage = document.getElementById("formErrorMessage");

    const productCards = document.querySelectorAll(".product-card");
    const fields = form.querySelectorAll("input, select, textarea");

    let selectedProduct = null;

    /* ========================================
       OUVRIR LE POPUP
       ======================================== */
    function openModal(card) {
        selectedProduct = {
            image: card.querySelector(".product-image")?.textContent.trim() || "🛍️",
            name: card.dataset.product || "Produit",
            price: card.dataset.prix || "Prix non disponible",
            description: card.dataset.description || "Aucune description disponible.",
            delai: card.dataset.delai || "À confirmer"
        };

        modalProductImage.textContent = selectedProduct.image;
        modalProductName.textContent = selectedProduct.name;
        modalProductPrice.textContent = selectedProduct.price;
        modalProductDesc.textContent = selectedProduct.description;
        modalProductDelai.textContent = selectedProduct.delai;

        modal.style.display = "flex";
        modal.setAttribute("aria-hidden", "false");

        document.body.style.overflow = "hidden";
    }

    /* ========================================
       FERMER LE POPUP
       ======================================== */
    function closeModal() {
        modal.style.display = "none";
        modal.setAttribute("aria-hidden", "true");

        document.body.style.overflow = "";
    }

    /* ========================================
       CLIC SUR LES PRODUITS
       ======================================== */
    productCards.forEach((card) => {
        card.addEventListener("click", (event) => {
            if (event.target.closest(".btn-view")) {
                return;
            }

            openModal(card);
        });

        const viewButton = card.querySelector(".btn-view");

        if (viewButton) {
            viewButton.addEventListener("click", (event) => {
                event.preventDefault();
                event.stopPropagation();

                openModal(card);
            });
        }
    });

    /* ========================================
       FERMETURE MODAL
       ======================================== */
    closeModalButton.addEventListener("click", closeModal);
    closeButton.addEventListener("click", closeModal);

    modal.addEventListener("click", (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && modal.style.display === "flex") {
            closeModal();
        }
    });

    /* ========================================
       BOUTON COMMANDER
       ======================================== */
    orderButton.addEventListener("click", () => {
        if (!selectedProduct) {
            return;
        }

        produitInput.value = `${selectedProduct.name} - ${selectedProduct.price}`;

        clearError(produitInput);

        closeModal();

        form.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

        setTimeout(() => {
            nomInput.focus();
        }, 500);
    });

    /* ========================================
       VALIDATION
       ======================================== */
    fields.forEach((field) => {
        field.addEventListener("blur", () => {
            validateField(field);
        });

        field.addEventListener("input", () => {
            if (field.value.trim() !== "") {
                clearError(field);
            }
        });

        field.addEventListener("change", () => {
            validateField(field);
        });
    });

    function validateField(field) {
        const value = field.value.trim();

        if (field.required && value === "") {
            showError(field, "Ce champ est obligatoire.");
            return false;
        }

        if (field.name === "nom" && value !== "" && value.length < 3) {
            showError(field, "Le nom doit contenir au moins 3 caractères.");
            return false;
        }

        if (field.type === "email" && value !== "") {
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailPattern.test(value)) {
                showError(field, "Veuillez saisir une adresse email valide.");
                return false;
            }
        }

        if (field.name === "telephone" && value !== "") {
            const phone = value.replace(/[\s.-]/g, "");
            const phonePattern = /^(05|06|07)\d{8}$/;

            if (!phonePattern.test(phone)) {
                showError(field, "Exemple : 0550123456");
                return false;
            }
        }

        if (field.name === "quantite" && value !== "" && Number(value) < 1) {
            showError(field, "La quantité minimum est 1.");
            return false;
        }

        clearError(field);
        return true;
    }

    function showError(field, message) {
        const errorElement = document.getElementById(`${field.id}Error`);

        field.style.borderColor = "#dc2626";
        field.style.boxShadow = "0 0 0 4px rgba(220, 38, 38, 0.12)";

        if (errorElement) {
            errorElement.textContent = message;
        }
    }

    function clearError(field) {
        const errorElement = document.getElementById(`${field.id}Error`);

        field.style.borderColor = "";
        field.style.boxShadow = "";

        if (errorElement) {
            errorElement.textContent = "";
        }
    }

    function showFormError(message) {
        formErrorMessage.textContent = message;
        formErrorMessage.style.display = "block";
    }

    function hideFormError() {
        formErrorMessage.textContent = "";
        formErrorMessage.style.display = "none";
    }

    /* ========================================
       ENVOI FORMSPREE
       Endpoint :
       https://formspree.io/f/mnpnkevr
       ======================================== */
    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        hideFormError();
        successMessage.style.display = "none";

        let isValid = true;

        fields.forEach((field) => {
            if (!validateField(field)) {
                isValid = false;
            }
        });

        if (!isValid) {
            showFormError("Veuillez corriger les champs en rouge.");

            const firstInvalid = form.querySelector(
                "input[style*='220'], select[style*='220'], textarea[style*='220']"
            );

            if (firstInvalid) {
                firstInvalid.focus();
            }

            return;
        }

        /* Afficher le chargement */
        submitButton.disabled = true;
        buttonText.style.display = "none";
        buttonLoading.style.display = "inline";

        try {
            const formData = new FormData(form);

            /* Ajouter la date d'envoi à l'email reçu */
            formData.append(
                "date_commande",
                new Date().toLocaleString("fr-FR")
            );

            const response = await fetch(form.action, {
                method: "POST",
                body: formData,
                headers: {
                    Accept: "application/json"
                }
            });

            if (response.ok) {
                form.reset();

                produitInput.value = "";
                selectedProduct = null;

                successMessage.style.display = "block";

                successMessage.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });
            } else {
                let errorText = "Erreur lors de l'envoi. Réessayez plus tard.";

                try {
                    const data = await response.json();

                    if (data.errors && data.errors.length > 0) {
                        errorText = data.errors
                            .map((error) => error.message)
                            .join(" ");
                    }
                } catch (jsonError) {
                    console.error("Erreur lecture réponse Formspree :", jsonError);
                }

                showFormError(errorText);
            }
        } catch (error) {
            console.error("Erreur de connexion :", error);

            showFormError(
                "Impossible d'envoyer la commande. Vérifiez votre connexion Internet."
            );
        } finally {
            submitButton.disabled = false;
            buttonText.style.display = "inline";
            buttonLoading.style.display = "none";
        }
    });
});