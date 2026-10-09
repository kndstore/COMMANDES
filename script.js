document.addEventListener("DOMContentLoaded", () => {
    /* ========================================
       ÉLÉMENTS HTML
       ======================================== */
    const form = document.getElementById("orderForm");
    const modal = document.getElementById("productModal");

    const produitInput = document.getElementById("produit");
    const nomInput = document.getElementById("nom");

    const wilayaSelect = document.getElementById("wilaya");
    const dairaSelect = document.getElementById("daira");
    const dairaHint = document.getElementById("dairaHint");

    const pointureSelect = document.getElementById("pointure");
    const couleurSelect = document.getElementById("couleur");

    const modalProductImage = document.getElementById("modalProductImage");
    const modalZoomHint = document.getElementById("modalZoomHint");
    const modalProductName = document.getElementById("modalProductName");
    const modalProductPrice = document.getElementById("modalProductPrice");
    const modalProductDesc = document.getElementById("modalProductDesc");
    const modalProductDelai = document.getElementById("modalProductDelai");
    const modalProductPointures = document.getElementById("modalProductPointures");
    const modalProductCouleurs = document.getElementById("modalProductCouleurs");

    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightboxImg");
    const lightboxClose = document.querySelector(".lightbox-close");

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
    let modalSelectedPointure = null;
    let modalSelectedCouleur = null;

    const DEFAULT_POINTURES = ["39", "40", "41", "42", "43", "44", "45"];
    const DEFAULT_COULEURS = [
        "Noir",
        "Marron",
        "Camel",
        "Bleu marine",
        "Autre"
    ];

    function getColorCode(colorName) {
        const lower = colorName.toLowerCase();
        if (lower.includes("noir") || lower.includes("أسود")) return "#1e293b";
        if (lower.includes("marron") || lower.includes("بني")) return "#6d3916";
        if (lower.includes("camel") || lower.includes("هافان")) return "#b46927";
        if (lower.includes("bleu") || lower.includes("أزرق")) return "#1d4ed8";
        if (lower.includes("gris") || lower.includes("رمادي")) return "#64748b";
        if (lower.includes("blanc") || lower.includes("أبيض")) return "#f8fafc";
        if (lower.includes("bordeaux") || lower.includes("عنابي")) return "#831843";
        return null;
    }

    function populateSelectOptions(selectEl, items, selectedValue) {
        if (!selectEl) return;
        const currentVal = selectedValue !== undefined ? selectedValue : selectEl.value;
        selectEl.innerHTML = "";

        const emptyOption = new Option("", "", true, true);
        emptyOption.disabled = true;
        selectEl.add(emptyOption);

        items.forEach((item) => {
            const opt = new Option(item, item);
            selectEl.add(opt);
        });

        if (currentVal && items.includes(currentVal)) {
            selectEl.value = currentVal;
        } else if (items.length === 1) {
            selectEl.value = items[0];
        } else {
            selectEl.value = "";
        }
    }

    /* ========================================
       WILAYA -> DAIRA
       Les données sont dans dairas.js
       ======================================== */
    function fillDairas() {
        // La valeur de la wilaya commence par son code : "19 - Sétif" -> "19"
        const code = wilayaSelect.value.slice(0, 2);
        const list = (typeof DAIRAS !== "undefined" && DAIRAS[code]) || [];

        dairaSelect.innerHTML = "";

        const emptyOption = new Option("", "", true, true);
        emptyOption.disabled = true;
        dairaSelect.add(emptyOption);

        list.forEach((name) => {
            dairaSelect.add(new Option(name, name));
        });

        dairaSelect.disabled = list.length === 0;
        dairaHint.style.display = list.length === 0 ? "block" : "none";

        clearError(dairaSelect);
    }

    wilayaSelect.addEventListener("change", fillDairas);

    /* ========================================
       OUVRIR LE POPUP
       ======================================== */
    function openModal(card) {
        const photo = card.querySelector(".product-image img");

        const cardPointures = card.dataset.pointures
            ? card.dataset.pointures.split(",").map(s => s.trim()).filter(Boolean)
            : DEFAULT_POINTURES;

        const cardCouleurs = card.dataset.couleurs
            ? card.dataset.couleurs.split(",").map(c => c.trim()).filter(Boolean)
            : DEFAULT_COULEURS;

        selectedProduct = {
            imageSrc: photo ? photo.getAttribute("src") : null,
            imageAlt: photo ? photo.getAttribute("alt") || "" : "",
            emoji: card.querySelector(".product-image")?.textContent.trim() || "🛍️",
            name: card.dataset.product || "Produit",
            price: card.dataset.prix || "Prix non disponible",
            description: card.dataset.description || "Aucune description disponible.",
            delai: card.dataset.delai || "À confirmer",
            pointures: cardPointures,
            couleurs: cardCouleurs
        };

        /* Image du produit (photo du dossier img, sinon emoji) */
        modalProductImage.textContent = "";

        if (selectedProduct.imageSrc) {
            const img = document.createElement("img");
            img.src = selectedProduct.imageSrc;
            img.alt = selectedProduct.imageAlt;

            modalProductImage.appendChild(img);
            modalProductImage.classList.add("has-photo");
            modalZoomHint.style.display = "block";
        } else {
            modalProductImage.textContent = selectedProduct.emoji;
            modalProductImage.classList.remove("has-photo");
            modalZoomHint.style.display = "none";
        }

        modalProductName.textContent = selectedProduct.name;
        modalProductPrice.textContent = selectedProduct.price;
        modalProductDesc.textContent = selectedProduct.description;
        modalProductDelai.textContent = selectedProduct.delai;

        /* Rendu interactif des pointures dans la modale */
        modalSelectedPointure = cardPointures.length === 1 ? cardPointures[0] : null;
        if (modalProductPointures) {
            modalProductPointures.innerHTML = "";
            cardPointures.forEach((pt) => {
                const btn = document.createElement("button");
                btn.type = "button";
                btn.className = "option-pill" + (pt === modalSelectedPointure ? " active" : "");
                btn.textContent = pt;
                btn.addEventListener("click", () => {
                    modalProductPointures.querySelectorAll(".option-pill").forEach(p => p.classList.remove("active"));
                    if (modalSelectedPointure === pt && cardPointures.length > 1) {
                        modalSelectedPointure = null;
                    } else {
                        btn.classList.add("active");
                        modalSelectedPointure = pt;
                    }
                });
                modalProductPointures.appendChild(btn);
            });
        }

        /* Rendu interactif des couleurs dans la modale */
        modalSelectedCouleur = cardCouleurs.length === 1 ? cardCouleurs[0] : null;
        if (modalProductCouleurs) {
            modalProductCouleurs.innerHTML = "";
            cardCouleurs.forEach((clr) => {
                const btn = document.createElement("button");
                btn.type = "button";
                btn.className = "option-pill" + (clr === modalSelectedCouleur ? " active" : "");

                const dotColor = getColorCode(clr);
                if (dotColor) {
                    const dot = document.createElement("span");
                    dot.className = "color-dot";
                    dot.style.backgroundColor = dotColor;
                    btn.appendChild(dot);
                }

                const label = document.createElement("span");
                label.textContent = clr;
                btn.appendChild(label);

                btn.addEventListener("click", () => {
                    modalProductCouleurs.querySelectorAll(".option-pill").forEach(p => p.classList.remove("active"));
                    if (modalSelectedCouleur === clr && cardCouleurs.length > 1) {
                        modalSelectedCouleur = null;
                    } else {
                        btn.classList.add("active");
                        modalSelectedCouleur = clr;
                    }
                });
                modalProductCouleurs.appendChild(btn);
            });
        }

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
       AGRANDIR L'IMAGE (LIGHTBOX)
       ======================================== */
    function openLightbox() {
        if (!selectedProduct || !selectedProduct.imageSrc) {
            return;
        }

        lightboxImg.src = selectedProduct.imageSrc;
        lightboxImg.alt = selectedProduct.imageAlt;

        lightbox.style.display = "flex";
        lightbox.setAttribute("aria-hidden", "false");
    }

    function closeLightbox() {
        lightbox.style.display = "none";
        lightbox.setAttribute("aria-hidden", "true");
        lightboxImg.src = "";
    }

    modalProductImage.addEventListener("click", () => {
        if (modalProductImage.classList.contains("has-photo")) {
            openLightbox();
        }
    });

    lightboxClose.addEventListener("click", closeLightbox);

    lightbox.addEventListener("click", (event) => {
        // Clic sur le fond noir (pas sur l'image) = fermer
        if (event.target !== lightboxImg) {
            closeLightbox();
        }
    });

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
        if (event.key !== "Escape") {
            return;
        }

        // Escape ferme d'abord l'image agrandie, puis le popup
        if (lightbox.style.display === "flex") {
            closeLightbox();
            return;
        }

        if (modal.style.display === "flex") {
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

        /* Synchroniser la pointure */
        populateSelectOptions(pointureSelect, selectedProduct.pointures, modalSelectedPointure);
        if (pointureSelect && pointureSelect.value) {
            clearError(pointureSelect);
        }

        /* Synchroniser la couleur */
        populateSelectOptions(couleurSelect, selectedProduct.couleurs, modalSelectedCouleur);
        if (couleurSelect && couleurSelect.value) {
            clearError(couleurSelect);
        }

        closeModal();

        form.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

        setTimeout(() => {
            if (pointureSelect && !pointureSelect.value) {
                pointureSelect.focus();
            } else if (couleurSelect && !couleurSelect.value) {
                couleurSelect.focus();
            } else {
                nomInput.focus();
            }
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
        // Champ désactivé (ex : daira avant le choix de la wilaya) : ignoré
        if (field.disabled) {
            return true;
        }

        const value = field.value.trim();

        if (field.required && value === "") {
            showError(field, "Ce champ est obligatoire.");
            return false;
        }

        if (field.name === "pointure" && field.required && value === "") {
            showError(field, "Veuillez choisir une pointure.");
            return false;
        }

        if (field.name === "couleur" && field.required && value === "") {
            showError(field, "Veuillez choisir une couleur.");
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
                modalSelectedPointure = null;
                modalSelectedCouleur = null;

                populateSelectOptions(pointureSelect, DEFAULT_POINTURES, "");
                populateSelectOptions(couleurSelect, DEFAULT_COULEURS, "");

                /* Remettre la daira à zéro (liste vide + désactivée) */
                fillDairas();

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

    /* Initialiser les sélecteurs de pointure et couleur au chargement */
    populateSelectOptions(pointureSelect, DEFAULT_POINTURES, "");
    populateSelectOptions(couleurSelect, DEFAULT_COULEURS, "");
});
