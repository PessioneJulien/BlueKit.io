-- Lire le contenu du fichier avec encodage UTF-8
do shell script "echo 'Tâche lancée à ' $(date) >> ~/cron_script_log.txt"
set fileContent to do shell script "cat /Users/julien/BlueKit.io/next_tasks.txt"

tell application "Terminal"
	activate
	-- S'assurer qu'on est dans la bonne fenêtre
	if (count of windows) > 0 then
		set frontmost of window 1 to true
	else
		do script ""
	end if
end tell

delay 0.5 -- Pause pour s'assurer que Terminal est actif

tell application "System Events"
	tell process "Terminal"
		set frontmost to true
		-- Nettoyer l'input actuel avec Cmd+A puis Delete
		key down command
		keystroke "a"
		key up command
		delay 0.1
		key code 51 -- Delete
		delay 0.2
		
		-- Envoyer le contenu du fichier ligne par ligne pour éviter les problèmes d'encodage
		set AppleScript's text item delimiters to ASCII character 10
		set fileLines to text items of fileContent
		
		repeat with aLine in fileLines
			keystroke aLine
			keystroke return
			delay 0.05
		end repeat
		
		delay 0.5
		-- Double Enter pour envoyer dans Claude
		keystroke return
		delay 0.1
		keystroke return
	end tell
end tell
