<?php

	$response = new stdclass();

	$input = file_get_contents("php://input");
	$input = json_decode($input);
	$global = false;
	if (strpos($input->flags, "g") !== false) {
		$input->flags = str_replace ("g", "", $input->flags);
		$global = true;
	}

	$response = new stdclass();
	$response->infinity = false;
	$response->matchArray = array();
	
	set_error_handler(null);	
	$response->substitution = @preg_replace ( "/".$input->pattern."/". $input->flags , $input->substitution , $input->subject, ($global ? -1 : 1));
	$error = error_get_last();
	if (isset($error) && is_array($error) && $error['message']) {
		$response->error = str_replace("preg_replace():", "", $error['message']);
		echo json_encode($response);
		return;
	}
	if ($global) {
		preg_match_all ( "/".$input->pattern."/". $input->flags, $input->subject, $matches, PREG_OFFSET_CAPTURE);
		if(isset($matches) && count($matches) > 0) {
			if(count($matches[0]) > 0) {
				foreach ($matches[0] as $match) {
					$m = new stdclass();
					$m->index = $match[1];
					$m->m = $match[0];
					$response->matchArray[] = $m;
				}
			}
		}
	} else {
		preg_match ( "/".$input->pattern."/". $input->flags, $input->subject, $matches, PREG_OFFSET_CAPTURE);
		if(isset($matches) && is_array($matches) && count($matches) > 0) {
			$m = new stdclass();
			$m->index = $matches[0][1];
			$m->m = $matches[0][0];
			$response->matchArray[] = $m;
		}
	}
	echo json_encode($response);

?>
