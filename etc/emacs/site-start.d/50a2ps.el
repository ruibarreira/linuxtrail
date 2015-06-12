;; -*-emacs-lisp-*-
;;
;; Emacs startup file for the Debian a2ps package
;;
;; Originally contributed by Nils Naumann <naumann@unileoben.ac.at>
;; Modified by Dirk Eddelbuettel <edd@debian.org>
;; Adapted for dh-make by Jim Van Zandt <jrv@vanzandt.mv.com>

;; The a2ps package follows the Debian/GNU Linux 'emacsen' policy and
;; byte-compiles its elisp files for each 'emacs flavor' (emacs19,
;; xemacs19, emacs20, xemacs20...).  The compiled code is then
;; installed in a subdirectory of the respective site-lisp directory.
;; We have to add this to the load-path:
(setq load-path (cons (concat "/usr/share/"
                              (symbol-name flavor)
			      "/site-lisp/a2ps") load-path))
;; a2ps
(autoload 'a2ps-mode "a2ps" nil t)
(setq auto-mode-alist
      (cons '(".*\\.a2ps$" . a2ps-mode)
	    auto-mode-alist))

;; a2ps-print
(autoload 'a2ps-buffer "a2ps-print"
  "Print buffer contents as with Unix command `a2ps'.
    `a2ps-switches' is a list of extra switches (strings) to pass to a2ps."
  t)
(autoload 'a2ps-region "a2ps-print"
  "Print region contents as with Unix command `a2ps'.
    `a2ps-switches' is a list of extra switches (strings) to pass to a2ps."
  t)

(if (featurep 'xemacs)
    (progn
     (global-set-key 'f22 'a2ps-buffer)
     (global-set-key '(shift f22) 'a2ps-region-1)
     (add-menu-button '("File") ["a2ps-print" a2ps-buffer "--"])
     )
  (progn
   (global-set-key [f22] 'a2ps-buffer)
   (global-set-key [S-f22] 'a2ps-region-1)
   (define-key-after menu-bar-files-menu [a2ps-print]
     '(menu-item "a2ps" a2ps-buffer :help "Print with a2ps")
     'ps-print-region)
   )
  )

