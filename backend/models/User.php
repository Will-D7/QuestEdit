<?php
class User{
    public $id;
    public $name;
    public $email;
    public $password;

    public function __construct($data){
        $this->name     = $data['name'] ?? '';
        $this->email    = $data['email'] ??'';
        $this->password = $data['password'] ??'';

    }

}